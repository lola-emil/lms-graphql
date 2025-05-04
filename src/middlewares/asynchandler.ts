import { NextFunction, Request, Response } from "express";


type AsyncHandler = (req: Request, res: Response) => Promise<any>;

/**
 * Handles async controllers
 * @param handler Controller function 
 */
export default function asyncHandler(handler: AsyncHandler) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res);
        } catch (error) {
            next(error);
        }
    };
}