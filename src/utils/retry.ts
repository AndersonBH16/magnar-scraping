import { HttpRequestError } from '../http/httpErrors';
import { logger } from './logger';
import { sleep } from './sleep';

export interface RetryOptions {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    label?: string;
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
    const { maxRetries, baseDelayMs, maxDelayMs, label = 'operación' } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const isRateLimited = error instanceof HttpRequestError && error.isTooManyRequests();

            if (!isRateLimited) {
                throw error;
            }

            if (attempt > maxRetries) {
                logger.warn(`[${label}] Se agotaron los ${maxRetries} reintentos tras recibir 429.`);
                break;
            }

            const delay = calculateBackoffDelay(attempt, baseDelayMs, maxDelayMs);
            logger.warn(
                `[${label}] HTTP 429 recibido (intento ${attempt}/${maxRetries}). Reintentando en ${delay}ms...`
            );
            await sleep(delay);
        }
    }

    throw lastError;
}

function calculateBackoffDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
    const exponential = baseDelayMs * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, maxDelayMs);
    const jitterFactor = 0.8 + Math.random() * 0.4;
    return Math.round(capped * jitterFactor);
}