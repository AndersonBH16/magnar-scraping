import * as cheerio from 'cheerio';
import { JSF_FORM } from './constants';
import { logger } from '../utils/logger';

export function extractViewStateFromHtml(html: string): string {
    const $ = cheerio.load(html);
    const value = $(`input[name="${JSF_FORM.viewStateInputName}"]`).attr('value');

    if (!value) {
        throw new Error('javax.faces.ViewState not found.');
    }
    return value;
}

export function extractViewStateFromPartialResponse(xml: string): string {
    const regex =
        /<update id="[^"]*javax\.faces\.ViewState[^"]*"><!\[CDATA\[([^\]]*)\]\]><\/update>/;
    const match = xml.match(regex);

    if (!match || !match[1]) {
        logger.error('ViewState cant be found');
        logger.error(xml.substring(0, 500));
        throw new Error('No se encontró javax.faces.ViewState en la respuesta <partial-response>.');
    }

    return match[1];
}

export function extractPartialUpdateContent(xml: string, updateId: string): string | null {
    const escapedId = updateId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`<update id="${escapedId}"><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></update>`);
    const match = xml.match(regex);
    return match ? match[1] : null;
}

export function isPartialResponse(body: string): boolean {
    return body.trimStart().startsWith('<?xml') || body.includes('<partial-response');
}