import { Request, Response, NextFunction } from "express";
import Logger from "../util/logger";
import { ApiResponse, ErrorResponse } from "../util/response";

export default function errorHandler(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): unknown {
    if (error instanceof ErrorResponse) {
        const { status, message, data } = error;
        Logger.error(`${error.message}\n${error.stack}`);
        return res.status(status).json(new ApiResponse(status, message, data));
    }
    Logger.error(`Internal Server Error: ${error.message}\n${error.stack}`);
    const errorMessage = process.env.NODE_ENV === "production" ? "Something went wrong" : error.message;
    return res.status(500).json(new ApiResponse(500, errorMessage));
}