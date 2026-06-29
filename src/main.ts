import { logger } from './utils/logger';
import { config } from './config/env';

async function run(): Promise<void> {
    logger.info('Web Scraping for Magnar');
    logger.info(`URL: ${config.baseUrl}${config.searchPath}`);
}

run().catch((error) => {
    logger.error('Error fatal en main()', error);
    process.exit(1);
});