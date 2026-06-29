import fs from 'fs';
import path from 'path';
import { TfaRecord } from '../types/tfa.types';
import { config } from '../config/env';
import { ensureDir } from '../utils/fileSystem';
import { logger } from '../utils/logger';

/**
 * Responsable única: persistir el dataset completo de registros en JSON.
 * Si en el futuro se quisiera cambiar a CSV o a una base de datos,
 * solo se toca este archivo — el resto del scraper no sabe ni le importa
 * cómo se guardan los datos.
 */
export function saveRecordsToJson(records: TfaRecord[], fileName = 'tfa-records.json'): string {
    ensureDir(config.outputDir);
    const filePath = path.join(config.outputDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');
    logger.info(`💾 Resultados guardados en: ${filePath} (${records.length} registros)`);

    return filePath;
}