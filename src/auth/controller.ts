import { Request, Response } from "express";
import Joi from "joi";
import { ErrorResponse } from "../util/response";
import { PrismaClient } from "@prisma/client";
import argon from "argon2";

const signInBodySchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});

type Body = {
    email: string;
    password: string;
};

export async function signIn(req: Request, res: Response) {
    const body = req.body;
    const prisma = new PrismaClient();

    const { error } = signInBodySchema.validate(body, { abortEarly: false });

    if (error)
        throw new ErrorResponse(400, "Validation Error", error.details);

    let matchedUser = await prisma.user.findUnique({
        where: { email: body.email }
    });

    // check if email is valid
    if (!matchedUser)
        throw new ErrorResponse(400, "Validation Error", [
            {
                message: "Invalid email",
                path: [""],
                type: "",
                context: {
                    key: "email",
                    label: "email"
                }
            }
        ] as Joi.ValidationErrorItem[]);

    const passwordMatched = await argon.verify(matchedUser.password, body.password);

    // check if password is valid
    if (!passwordMatched)
        throw new ErrorResponse(400, "Validation Error", [
            {
                message: "Incorrect Password",
                path: [""],
                type: "",
                context: {
                    key: "password",
                    label: "password"
                }
            }
        ] as Joi.ValidationErrorItem[]);

    let result = await prisma.user.findUnique({
        where: { email: body.email },
        select: {
            id: true,
            email: true,
            firstname: true,
            middlename: true,
            lastname: true,
            role: true,
        }
    });
    return res.status(200).json(result);
}