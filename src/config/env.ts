import dotenv from 'dotenv';

dotenv.config();

function getEnvNumber(key: string, fallback: number): number {
    const raw = process.env[key];
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function getEnvString(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
}

function getEnvBoolean(key: string, fallback: boolean): boolean {
    const raw = process.env[key];
    if (!raw) return fallback;
    return raw.toLowerCase() === 'true';
}

export const config = {
    baseUrl: getEnvString('BASE_URL', 'https://publico.oefa.gob.pe'),
    searchPath: getEnvString('SEARCH_PATH', '/repdig/consulta/consultaTfa.xhtml'),
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    delayBetweenRequestsMs: getEnvNumber('DELAY_BETWEEN_REQUESTS_MS', 1500),
    retry: {
        maxRetries: getEnvNumber('RETRY_MAX_RETRIES', 5),
        baseDelayMs: getEnvNumber('RETRY_BASE_DELAY_MS', 1000),
        maxDelayMs: getEnvNumber('RETRY_MAX_DELAY_MS', 30000),
    },
    outputDir: './data/output',
    pdfDir: './data/pdfs',
    logsDir: './logs',
    requestTimeoutMs: getEnvNumber('REQUEST_TIMEOUT_MS', 20000),
    debug: getEnvBoolean('DEBUG', false),
} as const;