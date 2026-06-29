import { config } from '../config/env';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function format(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
}

export const logger = {
    info: (message: string) => console.log(format('INFO', message)),
    warn: (message: string) => console.warn(format('WARN', message)),
    error: (message: string, error?: unknown) => {
        console.error(format('ERROR', message));
        if (error instanceof Error) {
            console.error(error.stack ?? error.message);
        } else if (error) {
            console.error(error);
        }
    },
    debug: (message: string) => {
        if (config.debug) {
            console.log(format('DEBUG', message));
        }
    },
};