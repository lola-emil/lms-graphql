import { Request, Response, NextFunction } from "express";
import errorHandler from "../../src/middlewares/errorhandler"; // update this
import { ErrorResponse, ApiResponse } from "../../src/util/response";
import Logger from "../../src/util/logger";

jest.mock("../../src/util/logger");

describe("errorHandler middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockNext = jest.fn();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRes = {
      status: statusMock,
    };

    jest.clearAllMocks();
  });

  it("should handle ErrorResponse and respond with given status and message", () => {
    const error = new ErrorResponse(404, "Not Found", { detail: "Resource missing" });

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining("Not Found"));
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(new ApiResponse(404, "Not Found", { detail: "Resource missing" }));
  });

  it("should handle generic error and respond with 500 and full message in non-production", () => {
    process.env.NODE_ENV = "development";

    const error = new Error("Something bad happened");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining("Something bad happened"));
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(new ApiResponse(500, "Something bad happened"));
  });

  it("should return generic message in production", () => {
    process.env.NODE_ENV = "production";

    const error = new Error("Sensitive error message");

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(new ApiResponse(500, "Something went wrong"));
  });
});
