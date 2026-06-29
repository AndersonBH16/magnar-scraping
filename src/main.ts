import { logger } from './utils/logger';
import { searchAll } from './services/searchService';

async function main(): Promise<void> {
    const records = await searchAll();

    logger.info(`Total de registros: ${records.length}`);
    logger.info('Primeros 3 registros:');
    console.log(JSON.stringify(records.slice(0, 3), null, 2));

    logger.info('Últimos 3 registros:');
    console.log(JSON.stringify(records.slice(-3), null, 2));
}

main().catch((error) => {
    logger.error('Error en la prueba de Fase 5', error);
    process.exit(1);
});