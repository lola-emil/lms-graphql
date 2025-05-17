import { signIn } from "../../../src/services/auth/controller";
import argon from "argon2";
import { Request, Response } from "express";
import { ErrorResponse } from "../../../src/util/response";
import { Prisma, PrismaClient } from "@prisma/client";

// Mock argon2
jest.mock("argon2");

describe("signIn", () => {
    const mockReq = {
        body: {}
    } as Request;

    const mockJson = jest.fn();
    const mockStatus = jest.fn(() => ({ json: mockJson }));
    const mockRes = { status: mockStatus } as unknown as Response;

    let sampleUser: any;

    beforeEach(async () => {
        const prisma = new PrismaClient();
        sampleUser = await prisma.user.create({
            data: {
                firstname: "sample",
                lastname: "sample",
                email: "sample@gmail.com",
                password: await argon.hash("letmein123"),
                role: "ADMIN"
            }
        });
        jest.clearAllMocks();
    });

    it("should throw error if user is not found", async () => {
        mockReq.body = { email: "notfound@example.com", password: "pass" };
        const { PrismaClient } = require("@prisma/client");
        PrismaClient.mockImplementation(() => ({
            user: {
                findUnique: jest.fn().mockResolvedValue(null)
            }
        }));

        await expect(signIn(mockReq, mockRes)).rejects.toThrow(ErrorResponse);
    });

      it("should authenticate successfully", async () => {
        const user = {
          id: 1,
          email: "sample@gmail.com",
          firstname: "sample",
          lastname: "sample",
          role: "ADMIN",
          password: ""
        };

        mockReq.body = { email: user.email, password: "letmein123" };

        const { PrismaClient } = require("@prisma/client");
        PrismaClient.mockImplementation(() => ({
          user: {
            findUnique: jest
              .fn()
              // 1st call: get user
              .mockResolvedValueOnce(user)
              // 2nd call: return selected fields
              .mockResolvedValueOnce({
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role
              })
          }
        }));

        (argon.verify as jest.Mock).mockResolvedValue(true);

        await signIn(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
          id: 1,
          email: "user@example.com",
        }));
      });
});
