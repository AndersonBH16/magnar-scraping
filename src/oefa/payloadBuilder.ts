import { JSF_FORM } from './constants';

interface SearchFilters {
    nroExpediente?: string;
    administrado?: string;
    unidadFiscalizable?: string;
    sector?: string;
    nroResolucionApelacion?: string;
}

export function buildSearchPayload(viewState: string, filters: SearchFilters = {}): Record<string, string> {
    return {
        'javax.faces.partial.ajax': 'true',
        'javax.faces.source': JSF_FORM.buttons.buscar,
        'javax.faces.partial.execute': '@all',
        'javax.faces.partial.render': `${JSF_FORM.dataTable.pgListaRegion} ${JSF_FORM.fields.nroExpediente}`,
        [JSF_FORM.buttons.buscar]: JSF_FORM.buttons.buscar,
        [JSF_FORM.formId]: JSF_FORM.formId,
        [JSF_FORM.fields.nroExpediente]: filters.nroExpediente ?? '',
        [JSF_FORM.fields.administrado]: filters.administrado ?? '',
        [JSF_FORM.fields.unidadFiscalizable]: filters.unidadFiscalizable ?? '',
        [JSF_FORM.fields.sector]: filters.sector ?? '',
        [JSF_FORM.fields.nroResolucionApelacion]: filters.nroResolucionApelacion ?? '',
        [JSF_FORM.fields.scrollState]: '0,0',
        'javax.faces.ViewState': viewState,
    };
}

export function buildPaginationPayload(
    viewState: string,
    firstRow: number,
    filters: SearchFilters = {}
): Record<string, string> {
    return {
        'javax.faces.partial.ajax': 'true',
        'javax.faces.source': JSF_FORM.dataTable.id,
        'javax.faces.partial.execute': JSF_FORM.dataTable.id,
        'javax.faces.partial.render': JSF_FORM.dataTable.id,
        [JSF_FORM.dataTable.id]: JSF_FORM.dataTable.id,
        [`${JSF_FORM.dataTable.id}_pagination`]: 'true',
        [`${JSF_FORM.dataTable.id}_first`]: String(firstRow),
        [`${JSF_FORM.dataTable.id}_rows`]: String(JSF_FORM.dataTable.rowsPerPage),
        [`${JSF_FORM.dataTable.id}_skipChildren`]: 'true',
        [`${JSF_FORM.dataTable.id}_encodeFeature`]: 'true',
        [JSF_FORM.formId]: JSF_FORM.formId,
        [JSF_FORM.fields.nroExpediente]: filters.nroExpediente ?? '',
        [JSF_FORM.fields.administrado]: filters.administrado ?? '',
        [JSF_FORM.fields.unidadFiscalizable]: filters.unidadFiscalizable ?? '',
        [JSF_FORM.fields.sector]: filters.sector ?? '',
        [JSF_FORM.fields.nroResolucionApelacion]: filters.nroResolucionApelacion ?? '',
        [JSF_FORM.fields.scrollState]: '0,0',
        'javax.faces.ViewState': viewState,
    };
}

export function buildPdfDownloadPayload(
    viewState: string,
    rowIndex: number,
    uuid: string,
    filters: SearchFilters = {}
): Record<string, string> {
    const linkId = `${JSF_FORM.dataTable.id}:${rowIndex}:j_idt63`;

    return {
        [JSF_FORM.formId]: JSF_FORM.formId,
        [JSF_FORM.fields.nroExpediente]: filters.nroExpediente ?? '',
        [JSF_FORM.fields.administrado]: filters.administrado ?? '',
        [JSF_FORM.fields.unidadFiscalizable]: filters.unidadFiscalizable ?? '',
        [JSF_FORM.fields.sector]: filters.sector ?? '',
        [JSF_FORM.fields.nroResolucionApelacion]: filters.nroResolucionApelacion ?? '',
        [JSF_FORM.fields.scrollState]: '0,0',
        'javax.faces.ViewState': viewState,
        [linkId]: linkId,
        param_uuid: uuid,
    };
}