

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

export class ErrorResponse extends Error {
    status: number;
    data: unknown;
    // errorId: string;

    constructor(status: number, message?: string, data?: unknown) {
        super();

        this.status = status;

        if (this.status >= 500)
            this.message = "Internal Server Error: " + this.message;

        this.message = String(message ?? "");
        this.data = data;
    }
}