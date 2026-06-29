import * as cheerio from 'cheerio';
import { TfaRecord, SearchPageResult } from '../types/tfa.types';
import { JSF_FORM} from "../oefa/constants";
import { logger } from '../utils/logger';

export function parseResultsTable(htmlFragment: string): TfaRecord[] {
    const $ = cheerio.load(`<table><tbody>${htmlFragment}</tbody></table>`);

    const records: TfaRecord[] = [];

    $('tr[data-ri]').each((_, rowEl) => {
        const $row = $(rowEl);
        const rowIndex = Number($row.attr('data-ri'));
        const cells = $row.find('td');
        const numeroExpediente = cleanText($(cells[1]).text());
        const administrado = cleanText($(cells[2]).text());
        const unidadFiscalizable = cleanText($(cells[3]).text());
        const sector = cleanText($(cells[4]).text());
        const numeroResolucionApelacion = cleanText($(cells[5]).text());

        const archivoCell = $(cells[6]);
        const paramUuid = extractParamUuid(archivoCell.html() ?? '');

        records.push({
            numeroExpediente,
            administrado,
            unidadFiscalizable,
            sector,
            numeroResolucionApelacion,
            archivoURL: null,
            archivoNombreSugerido: buildSuggestedFileName(numeroResolucionApelacion, numeroExpediente),
            rowIndex: Number.isNaN(rowIndex) ? -1 : rowIndex,
            paramUuid,
        });
    });

    logger.debug(`parseResultsTable: ${records.length} registros parseados`);
    return records;
}

export function parsePaginationInfo(html: string): Omit<SearchPageResult, 'records'> {
    const match = html.match(/Página\s+(\d+)\s+de\s+(\d+)\s*\((\d+)\s+registros?\)/i);

    if (!match) {
        return { currentPage: 1, totalPages: 1, totalRecords: 0 };
    }

    return {
        currentPage: Number(match[1]),
        totalPages: Number(match[2]),
        totalRecords: Number(match[3]),
    };
}

function extractParamUuid(cellHtml: string): string | null {
    const match = cellHtml.match(/'param_uuid'\s*:\s*'([0-9a-fA-F-]+)'/);
    return match ? match[1] : null;
}

function buildSuggestedFileName(numeroResolucion: string, numeroExpediente: string): string {
    const base = numeroResolucion?.trim() || numeroExpediente?.trim() || 'documento';
    return (
        base
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.-]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '') + '.pdf'
    );
}

function cleanText(raw: string): string {
    return raw.replace(/\s+/g, ' ').trim();
}

export { JSF_FORM };