import fs from 'fs';
import path from 'path';
import { TfaRecord } from '../types/tfa.types';
import { config } from '../config/env';
import { ensureDir } from './fileSystem';

export interface FailedDownloadEntry {
    numeroExpediente: string;
    numeroResolucionApelacion: string;
    rowIndex: number;
    paramUuid: string | null;
    error: string;
    failedAt: string;
}

const FAILED_LOG_PATH = path.join('./logs', 'failed-downloads.json');

export function appendFailedDownload(record: TfaRecord, error: string): void {
    ensureDir(config.logsDir);

    const entries = readFailedDownloads();

    entries.push({
        numeroExpediente: record.numeroExpediente,
        numeroResolucionApelacion: record.numeroResolucionApelacion,
        rowIndex: record.rowIndex,
        paramUuid: record.paramUuid,
        error,
        failedAt: new Date().toISOString(),
    });

    fs.writeFileSync(FAILED_LOG_PATH, JSON.stringify(entries, null, 2));
}

export function readFailedDownloads(): FailedDownloadEntry[] {
    if (!fs.existsSync(FAILED_LOG_PATH)) return [];

    try {
        const raw = fs.readFileSync(FAILED_LOG_PATH, 'utf-8');
        return JSON.parse(raw) as FailedDownloadEntry[];
    } catch {
        return [];
    }
}