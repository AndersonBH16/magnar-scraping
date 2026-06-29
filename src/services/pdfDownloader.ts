import path from 'path';
import { httpClient } from '../http/httpClient';
import { HttpRequestError } from '../http/httpErrors';
import { buildPdfDownloadPayload } from "../oefa/payloadBuilder";
import { TfaRecord, PdfDownloadResult } from '../types/tfa.types';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { sleep } from '../utils/sleep';
import { withRetry } from '../utils/retry';
import { ensureDir, writeFile, getAvailableFilePath } from '../utils/fileSystem';
import { appendFailedDownload } from '../utils/failedDownloadsLog';

export async function downloadPageRecords(
    records: TfaRecord[],
    viewState: string
): Promise<PdfDownloadResult[]> {
    ensureDir(config.pdfDir);

    const downloadable = records.filter((r) => r.paramUuid !== null);
    const results: PdfDownloadResult[] = [];

    for (const record of downloadable) {
        await sleep(config.delayBetweenRequestsMs);

        const result = await downloadOne(record, viewState);
        results.push(result);

        if (!result.success) {
            appendFailedDownload(record, result.error ?? 'Error desconocido');
        }

        logger.info(
            `${result.success ? '✅' : '❌'} ${record.numeroResolucionApelacion || record.numeroExpediente}${
                result.attempts > 1 ? ` (${result.attempts} intentos)` : ''
            }`
        );
    }

    return results;
}

async function downloadOne(record: TfaRecord, viewState: string): Promise<PdfDownloadResult> {
    if (!record.paramUuid) {
        return { record, success: false, error: 'Sin paramUuid', attempts: 0 };
    }

    const payload = buildPdfDownloadPayload(viewState, record.rowIndex, record.paramUuid);
    let attempts = 0;

    try {
        const { buffer, headers } = await withRetry(
            async () => {
                attempts++;
                return httpClient.postFormBinary(config.searchPath, payload);
            },
            {
                maxRetries: config.retry.maxRetries,
                baseDelayMs: config.retry.baseDelayMs,
                maxDelayMs: config.retry.maxDelayMs,
                label: record.numeroResolucionApelacion || record.numeroExpediente,
            }
        );

        if (!isLikelyPdf(buffer)) {
            return {
                record,
                success: false,
                error: `Respuesta no parece un PDF válido (Content-Type: ${headers['content-type']})`,
                attempts,
            };
        }

        const filePath = resolveFilePath(record);
        writeFile(filePath, buffer);

        return { record, success: true, filePath, attempts };
    } catch (error) {
        const message =
            error instanceof HttpRequestError
                ? `HTTP ${error.status}: ${error.message}`
                : error instanceof Error
                    ? error.message
                    : 'Error desconocido';

        return { record, success: false, error: message, attempts };
    }
}

function isLikelyPdf(buffer: Buffer): boolean {
    return buffer.length > 4 && buffer.subarray(0, 4).toString('ascii') === '%PDF';
}

function resolveFilePath(record: TfaRecord): string {
    const desiredPath = path.join(config.pdfDir, record.archivoNombreSugerido);
    return getAvailableFilePath(desiredPath);
}