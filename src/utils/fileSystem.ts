import fs from 'fs';
import path from 'path';

export function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export function writeFile(filePath: string, buffer: Buffer): void {
    fs.writeFileSync(filePath, buffer);
}

export function getAvailableFilePath(filePath: string): string {
    if (!fs.existsSync(filePath)) return filePath;

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);

    let counter = 1;
    let candidate = path.join(dir, `${base}_${counter}${ext}`);
    while (fs.existsSync(candidate)) {
        counter++;
        candidate = path.join(dir, `${base}_${counter}${ext}`);
    }
    return candidate;
}