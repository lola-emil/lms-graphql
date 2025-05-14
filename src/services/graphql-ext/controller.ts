import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { PORT } from "../../config/constants";

type Body = {
    comment: string;
    studentId: number;
    assignmentId: number;
};

export async function submitAssignment(req: Request, res: Response) {
    const attachments = req.files;
    const prisma = new PrismaClient();

    const body = {
        ...req.body,
        attachments
    };

    console.log("bullshit",attachments);

    const submissionTransaction = await prisma.$transaction(async (trx) => {
        const assignment = await trx.assignment.findUnique({ where: { id: parseInt(body.assignmentId) } });
        const submission = await trx.assignmentSubmission.create({
            data: {
                title: assignment?.title,
                comment: body.comment,
                studentId: parseInt(body.studentId),
                assignmentId: parseInt(body.assignmentId)
            }
        });

        if ((<any>attachments)?.length > 0) {
            await trx.assignmentSubmissionAttachment.createMany({
                data: (<any[]>attachments).map(val => ({
                    fileURL: `localhost:${PORT}/public/uploads/${val.filename}`,
                    assignmentSubmissionId: submission.id
                }))
            });
        }

        return await trx.assignmentSubmission.findUnique({
            where: { id: submission.id },
            include: { AssignmentSubmissionAttachment: true }
        });
    });


    console.log(submissionTransaction);

    return res.status(200).json({
        message: "Para submit",
        body,
        submissionTransaction
    });
}   