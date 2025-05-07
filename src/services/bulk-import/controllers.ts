import { Request, Response } from "express";
import { xlsx_to_csv } from "../../lib/doc_parser";
import { sendMail } from "../../util/mailer";

import parser from "csvtojson";
import generatePassword from "../../util/passwordGenerator";

export async function bulkImportUsers(req: Request, res: Response) {
    const csv = xlsx_to_csv(req.file?.path ?? '');
    const data = (await parser().fromString(csv)) as { email: string; }[];

    
    /**
     * TODO: add validations and katong para save sa database
     */

    for (let i = 0; i < data.length; i++) {
        const password = generatePassword();
        const result = await sendMail(data[i].email, { 
            text: `
                imong password kay: ${password}
            `
        });

    }

    return res.status(200).json({
        message: "Tr",
        data
    });
}

export async function bulkTeacherEnrollment(req: Request, res: Response) {

}

export async function bulkStudentEnrollment(req: Request, res: Response) {

}