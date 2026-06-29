import { HttpRequestError} from "../http/httpErrors";
import { withRetry} from "../utils/retry";
import { logger} from "../utils/logger";

/**
 * Diseñé este script de prueba para validar el 429 handler
 * Este script simula 3 escenarios:
 *   1. Éxito al primer intento (caso feliz, sin retry)
 *   2. Falla con 429 dos veces, luego responde con éxito (retry exitoso)
 *   3. Falla con 429 siempre (agota reintentos, debe propagar el error)
 *   4. Falla con un error que NO es 429 (debe fallar inmediato, sin retry)
 *
 * Ejecutar con: npm run test:retry
 */

const RETRY_OPTIONS = {
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 5000,
};

function createFlakyFn(failuresBeforeSuccess: number, label: string) {
    let callCount = 0;
    return async (): Promise<string> => {
        callCount++;
        if (callCount <= failuresBeforeSuccess) {
            logger.info(`  → [${label}] Llamada #${callCount}: simulando HTTP 429...`);
            throw new HttpRequestError('Too Many Requests (simulado)', 429, '/fake-endpoint');
        }
        logger.info(`  → [${label}] Llamada #${callCount}: éxito simulado.`);
        return `OK tras ${callCount} llamada(s)`;
    };
}

async function createAlwaysServerErrorFn(): Promise<string> {
    logger.info('  → [Caso 4] Simulando HTTP 500 (no debería reintentar)...');
    throw new HttpRequestError('Internal Server Error (simulado)', 500, '/fake-endpoint');
}

async function runScenario(title: string, fn: () => Promise<string>): Promise<void> {
    logger.info(`\n=== ${title} ===`);
    const start = Date.now();
    try {
        const result = await withRetry(fn, { ...RETRY_OPTIONS, label: title });
        const elapsed = Date.now() - start;
        logger.info(`✅ Resultado: "${result}" (${elapsed}ms transcurridos)`);
    } catch (error) {
        const elapsed = Date.now() - start;
        const message = error instanceof Error ? error.message : 'Error desconocido';
        logger.info(`❌ Falló como se esperaba: "${message}" (${elapsed}ms transcurridos)`);
    }
}

async function main(): Promise<void> {
    logger.info('Iniciando pruebas de withRetry()...');

    await runScenario('Caso 1: Éxito al primer intento', createFlakyFn(0, 'Caso 1'));
    await runScenario('Caso 2: Retry exitoso (falla 2 veces, éxito al 3er intento)', createFlakyFn(2, 'Caso 2'));
    await runScenario('Caso 3: Agota reintentos (429 persistente)', createFlakyFn(99, 'Caso 3'));
    await runScenario('Caso 4: Error no-429 (falla inmediato, sin retry)', createAlwaysServerErrorFn);

    logger.info('\n✅ Pruebas de withRetry() finalizadas.');
}

main().catch((error) => {
    logger.error('Error inesperado ejecutando las pruebas de retry', error);
    process.exit(1);
});