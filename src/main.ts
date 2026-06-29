import { logger } from './utils/logger';
import { config } from './config/env';
import { searchAll } from './services/searchService';
import { downloadPageRecords } from './services/pdfDownloader';
import { saveRecordsToJson } from './services/resultsStorage';
import { readFailedDownloads } from './utils/failedDownloadsLog';
import { PdfDownloadResult } from './types/tfa.types';

async function main(): Promise<void> {
    const startTime = Date.now();
    logger.info('🚀 Iniciando scraper de Resoluciones (OEFA)');
    logger.info(`Target: ${config.baseUrl}${config.searchPath}`);

    const allDownloadResults: PdfDownloadResult[] = [];

    const { records } = await searchAll(async (pageRecords, viewState, pageNumber) => {
        const results = await downloadPageRecords(pageRecords, viewState);
        allDownloadResults.push(...results);

        const pageSuccess = results.filter((r) => r.success).length;
        logger.info(`📄 Página ${pageNumber}: ${pageSuccess}/${results.length} PDFs descargados.`);
    });

    saveRecordsToJson(records);

    printSummary(records.length, allDownloadResults, startTime);
}

function printSummary(totalRecords: number, downloadResults: PdfDownloadResult[], startTime: number): void {
    const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    const successCount = downloadResults.filter((r) => r.success).length;
    const failedCount = downloadResults.length - successCount;
    const failedLogEntries = readFailedDownloads();

    logger.info('\n========== RESUMEN FINAL ==========');
    logger.info(`Registros encontrados:     ${totalRecords}`);
    logger.info(`PDFs descargados:          ${successCount}`);
    logger.info(`PDFs fallidos:             ${failedCount}`);
    logger.info(`Tiempo total:              ${elapsedMinutes} minutos`);

    if (failedLogEntries.length > 0) {
        logger.warn(`⚠️  Se encontraron ${failedLogEntries.length} descargas registradas en logs/failed-downloads.json.`);
    }

    logger.info('====================================\n');
}

main().catch((error) => {
    logger.error('💥 Error fatal en la ejecución del scraper', error);
    process.exit(1);
});