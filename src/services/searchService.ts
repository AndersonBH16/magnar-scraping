import { httpClient } from '../http/httpClient';
import {
    extractViewStateFromHtml,
    extractViewStateFromPartialResponse,
    extractPartialUpdateContent,
    isPartialResponse
} from "../oefa/viewStateManager";
import { buildSearchPayload, buildPaginationPayload } from "../oefa/payloadBuilder";
import { parseResultsTable, parsePaginationInfo } from '../parser/resultParser';
import { JSF_FORM } from "../oefa/constants";
import { TfaRecord } from '../types/tfa.types';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { sleep } from '../utils/sleep';

export interface SearchAllResult {
    records: TfaRecord[];
    finalViewState: string;
}

export type OnPageParsed = (pageRecords: TfaRecord[], viewState: string, pageNumber: number) => Promise<void>;

export async function searchAll(onPageParsed?: OnPageParsed): Promise<SearchAllResult> {
    logger.info('Starting search');

    const { html: initialHtml } = await httpClient.get(config.searchPath);
    let viewState = extractViewStateFromHtml(initialHtml);

    const searchPayload = buildSearchPayload(viewState);
    const { html: searchResponse } = await httpClient.postForm(config.searchPath, searchPayload);

    if (!isPartialResponse(searchResponse)) {
        throw new Error('Respuesta inesperada: se esperaba un <partial-response> tras la búsqueda.');
    }

    viewState = extractViewStateFromPartialResponse(searchResponse);

    const pgListaContent = extractPartialUpdateContent(searchResponse, JSF_FORM.dataTable.pgListaRegion);
    if (!pgListaContent) {
        throw new Error('No se pudo extraer el contenido de la tabla de resultados.');
    }

    const allRecords: TfaRecord[] = parseResultsTable(pgListaContent);
    const paginationInfo = parsePaginationInfo(pgListaContent);

    const lastPageToFetch = config.maxPages
        ? Math.min(config.maxPages, paginationInfo.totalPages)
        : paginationInfo.totalPages;

    if (config.maxPages) {
        logger.warn(`⚠️ MAX_PAGES activo: se recorrerán: ${lastPageToFetch} de ${paginationInfo.totalPages} páginas totales.`);
    }

    logger.info(
        `Página 1 de ${paginationInfo.totalPages} obtenida (${allRecords.length} registros). Total esperado: ${paginationInfo.totalRecords}.`
    );

    if (onPageParsed) {
        await onPageParsed(allRecords, viewState, 1);
    }

    for (let page = 2; page <= lastPageToFetch; page++) {
        await sleep(config.delayBetweenRequestsMs);

        const firstRow = (page - 1) * JSF_FORM.dataTable.rowsPerPage;
        const paginationPayload = buildPaginationPayload(viewState, firstRow);

        const { html: pageResponse } = await httpClient.postForm(config.searchPath, paginationPayload);

        viewState = extractViewStateFromPartialResponse(pageResponse);

        const dtContent = extractPartialUpdateContent(pageResponse, JSF_FORM.dataTable.id);
        if (!dtContent) {
            logger.warn(`La página ${page} no puede ser scrapeada, se omitirá`);
            continue;
        }

        const pageRecords = parseResultsTable(dtContent);
        allRecords.push(...pageRecords);

        logger.info(`Página ${page}/${paginationInfo.totalPages} obtenida (${pageRecords.length} registros). Acumulado: ${allRecords.length}.`);

        if (onPageParsed) {
            await onPageParsed(pageRecords, viewState, page);
        }
    }

    logger.info(`✅ Search completed successfully. Total records retrieved: ${allRecords.length}.`);

    return { records: allRecords, finalViewState: viewState };
}