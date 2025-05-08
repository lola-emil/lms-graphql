import { Request, Response } from "express";
import { xlsx_to_csv } from "../../lib/doc_parser";
import { mailCredentials, sendMail } from "../../util/mailer";

import parser from "csvtojson";
import generatePassword from "../../util/passwordGenerator";
import Joi from "joi";
import { PrismaClient } from "@prisma/client";
import Logger from "../../util/logger";
import argon from "argon2";
import { BUSINESS_NAME } from "../../config/constants";


type User = {
    firstname: string;
    middlename: string | null;
    lastname: string;
    email: string;
    password: string;

    createdAt: Date;
    updatedAt: Date;

    role: "ADMIN" | "STUDENT" | "TEACHER" | null;
};

const userSchema = Joi.object({
    firstname: Joi.string().required(),
    middlename: Joi.string(),
    lastname: Joi.string().required(),

    email: Joi.string().email().required(),
    role: Joi.string().valid("ADMIN", "STUDENT", "TEACHER").required()
});

export async function bulkImportUsers(req: Request, res: Response) {
    const csv = xlsx_to_csv(req.file?.path ?? '');
    const parsedData = (await parser().fromString(csv)) as User[];

    const unsuccessful: Partial<User & { reason: any; }>[] = [];
    const successful: Partial<User>[] = [];

    const prisma = new PrismaClient();

    for (let i = 0; i < parsedData.length; i++) {
        const { error } = userSchema.validate(parsedData[i], { abortEarly: false });
        const {
            email,
            firstname,
            middlename,
            lastname,
            role,
        } = parsedData[i];

        // skip kung invalid ang data;
        if (error) {
            unsuccessful.push({
                ...parsedData[i],
                reason: error
            });
            continue;
        }

        const matchedUser = await prisma.user.findUnique({ where: { email: email } });

        if (matchedUser) {
            unsuccessful.push({
                ...parsedData[i],
                reason: [{
                    message: "Email already taken"
                }]
            });
            continue;
        }



        try {
            const password = generatePassword();
            const user = await prisma.user.create({
                data: {
                    firstname,
                    middlename,
                    lastname,
                    email,
                    role,
                    password: await argon.hash(password),
                },
                select: {
                    email: true,
                    firstname: true,
                    middlename: true,
                    lastname: true,

                    createdAt: true,
                    updatedAt: true
                }
            });

            await mailCredentials(email, {
                name: `${firstname} ${lastname}`,
                email,
                password,
                business: BUSINESS_NAME
            });

            successful.push(user);
        } catch (error) {
            unsuccessful.push({
                ...parsedData[i],
            });
            console.log(error);
            Logger.error("Internal Server Error");
        }
    }

    return res.status(200).json({
        message: "Import complete",
        successful,
        unsuccessful,
        data: parsedData
    });
}