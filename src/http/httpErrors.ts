export class HttpRequestError extends Error {
    public readonly status: number | undefined;
    public readonly url: string;

    constructor(message: string, status: number | undefined, url: string) {
        super(message);
        this.name = 'HttpRequestError';
        this.status = status;
        this.url = url;
    }

    public isTooManyRequests(): boolean {
        return this.status === 429;
    }
}