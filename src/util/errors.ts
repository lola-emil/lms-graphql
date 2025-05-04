

// errors/ValidationError.ts
export class ValidationError extends Error {
    public statusCode: number;
    public details?: Record<string, string[]>;

    constructor(message: string, details?: Record<string, string[]>) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.details = details;
    }
}
