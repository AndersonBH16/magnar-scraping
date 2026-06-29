export interface TfaRecord {
    numeroExpediente: string;
    administrado: string;
    unidadFiscalizable: string;
    sector: string;
    numeroResolucionApelacion: string;
    archivoURL: string | null;
    archivoNombreSugerido: string;
}

export interface SearchPageResult {
    records: TfaRecord[];
    currentPage: number;
    totalPages: number;
    totalRecords: number;
}

export interface JsfViewState {
    viewState: string;
    tableClientId?: string;
}

export interface PdfDownloadResult {
    record: TfaRecord;
    success: boolean;
    filePath?: string;
    error?: string;
    attempts: number;
}