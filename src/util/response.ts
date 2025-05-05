
export class ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    errors?: any;
    
    constructor(statusCode: number, message: string, data?: T, errors?: any) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.errors = errors;
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