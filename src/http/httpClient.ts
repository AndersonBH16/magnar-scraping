import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config/env';
import { HttpRequestError } from './httpErrors';

class HttpClient {
    private readonly axiosInstance: AxiosInstance;
    private cookieJar: string = '';

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: config.baseUrl,
            timeout: config.requestTimeoutMs,
            headers: {
                'User-Agent': config.userAgent,
                Accept: 'text/html,application/xhtml+xml,application/xml,*/*',
            },
            validateStatus: () => true,
        });

        this.axiosInstance.interceptors.response.use((response: AxiosResponse) => {
            const setCookie = response.headers['set-cookie'];
            if (setCookie && setCookie.length > 0) {
                this.mergeCookies(setCookie);
            }
            return response;
        });
    }

    private mergeCookies(setCookieHeaders: string[]): void {
        const newCookies: Record<string, string> = {};
        this.cookieJar.split(';').forEach((c) => {
            const [name, value] = c.trim().split('=');
            if (name) newCookies[name] = value;
        });

        setCookieHeaders.forEach((raw) => {
            const [name, value] = raw.split(';')[0].trim().split('=');
            if (name) newCookies[name] = value;
        });

        this.cookieJar = Object.entries(newCookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
    }

    public async get(path: string): Promise<{ html: string; status: number }> {
        const response = await this.axiosInstance.get<string>(path, {
            headers: { Cookie: this.cookieJar },
        });

        this.throwIfError(response.status, path);

        return { html: response.data, status: response.status };
    }

    public async postForm(
        path: string,
        formData: Record<string, string>
    ): Promise<{ html: string; status: number }> {
        const body = this.encodeForm(formData);

        const response = await this.axiosInstance.post<string>(path, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: this.cookieJar,
                Faces_Request: 'partial/ajax',
            },
        });

        this.throwIfError(response.status, path);

        return { html: response.data, status: response.status };
    }

    public async postFormBinary(
        path: string,
        formData: Record<string, string>
    ): Promise<{ buffer: Buffer; status: number; headers: Record<string, string> }> {
        const body = this.encodeForm(formData);

        const response = await this.axiosInstance.post<ArrayBuffer>(path, body, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: this.cookieJar,
            },
            responseType: 'arraybuffer',
        });

        this.throwIfError(response.status, path);

        return {
            buffer: Buffer.from(response.data),
            status: response.status,
            headers: response.headers as Record<string, string>,
        };
    }

    private encodeForm(formData: Record<string, string>): string {
        return Object.entries(formData)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    private throwIfError(status: number, path: string): void {
        if (status >= 400) {
            throw new HttpRequestError(`HTTP ${status} al llamar a ${path}`, status, path);
        }
    }
}

export const httpClient = new HttpClient();