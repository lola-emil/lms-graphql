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


    return res.status(200).json({
        message: "Para submit",
        body,
        submissionTransaction
    });
}

export async function uploadSubjectMaterial(req: Request, res: Response) {
    const attachments = req.files;
    const body = req.body;

    const prisma = new PrismaClient();

    const materialTransaction = await prisma.$transaction(async (trx) => {
        const material = await trx.subjectMaterial.create({
            data: {
                content: body.content,
                title: body.title,
                subjectId: parseInt(body.subjectId)
            }
        });

        if ((<any>attachments)?.length > 0) {
            await trx.subjectMaterialAttachments.createMany({
                data: (<any>attachments).map((val: any) => ({
                    fileURL: `localhost:${PORT}/public/uploads/${val.filename}`,
                    subjectMaterialId: material.id
                }))
            });
        }

        return await trx.subjectMaterial.findUnique({
            where: { id: material.id },
            include: { SubjectMaterialAttachments: true }
        });

    });

    return res.status(200).json(materialTransaction);
}


export async function addSubject(req: Request, res: Response) {
    const body = req.body as {
        title: string;
        gradeLevelId: string;
    };
    const coverImg = req.files;

    const prisma = new PrismaClient();

    const subject = await prisma.subject.create({
        data: {
            title: body.title,
            classLevelId: parseInt(body.gradeLevelId),
            coverImgUrl: (<any>coverImg)?.length > 0 ? `localhost:${PORT}/public/uploads/${(<any>coverImg)[0].filename}`
                : undefined
        }
    });

    return res.status(200).json(subject);
}

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

type Question = {
    id: string;
    questionText: string;
    type: QuestionType;
    answers: {
        answerText: string;
        correct: boolean;
    }[];
};

type Subject = {
    id: number;
    title: string;
};

export async function createQuiz(req: Request, res: Response) {
    const body = req.body as {
        subjectId: number;
        title: string;
        questions: Question[];
    };

    const prisma = new PrismaClient();

    try {
        const result = await prisma.$transaction(async trx => {
            // Create the quiz material
            const subjectMaterial = await trx.subjectMaterial.create({
                data: {
                    materialType: "QUIZ",
                    title: body.title,
                    subjectId: body.subjectId
                }
            });

            // Loop through questions and create them one by one
            for (const question of body.questions) {
                const createdQuestion = await trx.question.create({
                    data: {
                        questionText: question.questionText,
                        type: question.type,
                        subjectMaterialId: subjectMaterial.id
                    }
                });

                // Create answers associated with this question
                await trx.answer.createMany({
                    data: question.answers.map(answer => ({
                        answerText: answer.answerText,
                        isCorrect: answer.correct,
                        questionId: createdQuestion.id
                    }))
                });
            }

            return subjectMaterial;
        });

        return res.status(200).json({ success: true, quiz: result });
    } catch (err) {
        console.error("Quiz creation error:", err);
        return res.status(500).json({ success: false, message: "Quiz creation failed" });
    }
}