import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../src/middlewares/asynchandler"; // Update the path

describe("asyncHandler", () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call the handler and not call next if no error", async () => {
        const handler = jest.fn().mockResolvedValue(undefined);

        const wrapped = asyncHandler(handler);
        await wrapped(mockReq, mockRes, mockNext);

        expect(handler).toHaveBeenCalledWith(mockReq, mockRes);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch errors and call next with the error", async () => {
        const error = new Error("Test error");
        const handler = jest.fn().mockRejectedValue(error);

        const wrapped = asyncHandler(handler);
        await wrapped(mockReq, mockRes, mockNext);

        expect(handler).toHaveBeenCalledWith(mockReq, mockRes);
        expect(mockNext).toHaveBeenCalledWith(error);
    });
});
