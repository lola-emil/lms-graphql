import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { PORT } from "../../config/constants";
import { mailPasswordConfirmation } from "../../util/mailer";
import { ErrorResponse } from "../../util/response";
import argon from "argon2";

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


export async function finishQuiz(req: Request, res: Response) {
    const body = req.body as {
        id: number;
        studentId: number;
        answers: {
            id: number;
            answer: any;
        }[];
    };
    const prisma = new PrismaClient();



    const sessionTransaction = await prisma.$transaction(async trx => {
        let score = 0;
        for (let i = 0; i < body.answers.length; i++) {
            const userAnswer = body.answers[i];
            let question = await trx.question.findUnique({ where: { id: userAnswer.id } });

            if (question) {
                if (question.type == "TRUE_FALSE" || question.type == "MULTIPLE_CHOICE") {
                    if (!userAnswer.answer) continue;

                    const answer = await trx.answer.findUnique({
                        where: {
                            id: userAnswer.answer
                        }
                    });
                    if (answer && answer.isCorrect) score += 1;
                }

                if (question.type == "SHORT_ANSWER") {

                }
            }
        }

        // TODO: dapat usa ra ka session per quiz
        const session = await trx.quizSession.create({
            data: {
                quizId: body.id,
                studentId: body.studentId,
                score
            }
        });

        return session;
    });

    return res.status(200).json(sessionTransaction);
}

export async function requestUserUpdate(req: Request, res: Response) {
    const body = req.body as {
        firstname?: string;
        middlename?: string;
        lastname?: string;
        email?: string;
        password?: string;

        userId: number;
    };

    const prisma = new PrismaClient();

    const expiryInMinute = 5;

    const matchedUser = await prisma.user.findUnique({ where: { id: body.userId } });

    if (!matchedUser)
        throw new ErrorResponse(400, "", {
            message: ""
        });


    const userUpdateRequest = await prisma.userUpdateRequest.create({
        data: {
            expiry: new Date(Date.now() + expiryInMinute * 50 * 1000),
            code: Math.floor(100000 + Math.random() * 900000),
            data: body,
            userId: matchedUser.id
        }
    });


    await mailPasswordConfirmation(matchedUser.email, {
        expiry: expiryInMinute,
        firstname: matchedUser?.firstname,
        otpCode: userUpdateRequest.code
    });

    return res.status(200).json({
        message: "OTP sent to email"
    });
}

export async function confirmUserUpdate(req: Request, res: Response) {
    const body = req.body as {
        updateRequestId: number;
    };

    const prisma = new PrismaClient();

    const matchedRequest = await prisma.userUpdateRequest.findUnique({ where: { id: body.updateRequestId } });

    if (!matchedRequest)
        throw new ErrorResponse(400, "", {
            message: ""

        });

    if (!matchedRequest.active)
        throw new ErrorResponse(400, "", {
            message: "Code expired"
        });

    // Invalidate the update request
    await prisma.userUpdateRequest.update({
        data: {
            active: false
        },
        where: {
            id: matchedRequest.id
        }
    });

    const data = matchedRequest.data as {
        firstname?: string;
        middlename?: string;
        lastname?: string;
        email?: string;
        password?: string;

        userId: number;
    };

    if (data.password)
        data.password = await argon.hash(data.password);

    // Update ang user
    const user = await prisma.user.update({
        data: {
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname,
            email: data.email,
            password: data.password
        },
        where: {
            id: data.userId
        },
        select: {
            firstname: true,
            middlename: true,
            lastname: true,
            email: true,
            password: false
        }
    });

    return res.status(200).json(user);
}