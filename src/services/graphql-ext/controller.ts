import { Prisma, PrismaClient, SchoolYear } from "@prisma/client";
import { Request, Response } from "express";
import { PORT } from "../../config/constants";
import { mailPasswordConfirmation } from "../../util/mailer";
import { ErrorResponse } from "../../util/response";
import argon from "argon2";
import Joi from "joi";


type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

type Question = {
    id: string;
    questionText: string;
    type: QuestionType;
    answers: {
        id: number;
        answerText: string;
        correct: boolean;
    }[];
};

type Subject = {
    id: number;
    title: string;
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

        await trx.activityLog.create({
            data: {
                userId: parseInt(body.studentId),
                text: `Submitted assignment ${assignment?.title ?? 'untitled'}`
            }
        });

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


const subjectSchema = Joi.object({
    title: Joi.string().required(),
    gradeLevelId: Joi.required().messages({
        'string.empty': '"Grade Level" cannot be empty.',
        'any.required': '"Grade Level" is required.'
    })
});

export async function addSubject(req: Request, res: Response) {
    const body = req.body as {
        title: string;
        gradeLevelId: string | number;
    };

    body.gradeLevelId = parseInt(body.gradeLevelId + ""); // bwersit

    const { error } = subjectSchema.validate(body);

    if (error)
        return res.status(400).json(error.details);


    const prisma = new PrismaClient();
    const matchedSubject = await prisma.subject.findMany({
        where: {
            title: body.title,
            classLevelId: body.gradeLevelId
        }
    });

    if (matchedSubject.length > 0)
        return res.status(400).json([
            {
                message: "This subject already exist",
                context: {
                    label: "title",
                    key: "title"
                }
            }
        ] as Joi.ValidationErrorItem[]);

    const coverImg = req.files;
    const subject = await prisma.subject.create({
        data: {
            title: body.title,
            classLevelId: body.gradeLevelId,
            coverImgUrl: (<any>coverImg)?.length > 0 ? `localhost:${PORT}/public/uploads/${(<any>coverImg)[0].filename}`
                : undefined
        }
    });

    return res.status(200).json(subject);
}

export async function createQuiz(req: Request, res: Response) {
    const body = req.body as {
        teacherSubjectId: number;
        title: string;
        materialType: "QUIZ" | "EXAM";
        questions: Question[];
    };

    const prisma = new PrismaClient();

    try {
        const result = await prisma.$transaction(async trx => {
            // Create the quiz material
            const subjectMaterial = await trx.subjectMaterial.create({
                data: {
                    materialType: body.materialType,
                    title: body.title,
                    teacherSubjectId: body.teacherSubjectId
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
        teacherSubjectId: number;
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

        const quiz = await trx.subjectMaterial.findUnique({
            where: { id: body.id }, include: {
                Question: true
            }
        });

        await trx.studentGrade.create({
            data: {
                title: quiz?.title,
                studentId: body.studentId,
                teacherSubjectId: body.teacherSubjectId,
                category: quiz?.materialType as any,
                score,
                hps: quiz?.Question.length ?? 0
            },
        });

        // TODO: dapat usa ra ka session per quiz
        const session = await trx.quizSession.create({
            data: {
                quizId: body.id,
                studentId: body.studentId,
                score
            }
        });

        await trx.activityLog.create({
            data: {
                userId: body.studentId,
                text: `Completed Quiz ${quiz?.title}`
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
        id: userUpdateRequest.id,
        message: `Confirmation code sent to ${matchedUser.email}`,
        email: matchedUser.email,
        expiry: userUpdateRequest.expiry
    });
}

export async function confirmUserUpdate(req: Request, res: Response) {
    const body = req.body as {
        updateRequestId: number;
        code: number;
    };

    const prisma = new PrismaClient();

    const matchedRequest = await prisma.userUpdateRequest.findUnique({ where: { id: body.updateRequestId } });


    if (!matchedRequest)
        throw new ErrorResponse(400, "Error confirmation", {
            message: "Error confirmation"

        });

    if (body.code != matchedRequest.code)
        throw new ErrorResponse(400, "Incorrect code", {
            message: "Incorrect code"
        });

    if (!matchedRequest.active)
        throw new ErrorResponse(400, "Code expired", {
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

    await prisma.activityLog.create({
        data: {
            userId: data.userId,
            text: `User profile updated: ${user.firstname} ${user.lastname}`
        }
    });

    return res.status(200).json(user);
}

export async function uploadSubjectMaterial(req: Request, res: Response) {
    const attachments = req.files;
    const body = req.body;

    console.log(body);

    const prisma = new PrismaClient();

    const materialTransaction = await prisma.$transaction(async (trx) => {
        const material = await trx.subjectMaterial.create({
            data: {
                content: body.content,
                title: body.title,
                teacherSubjectId: parseInt(body.teacherSubjectId),
                materialType: "MODULE"
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

export async function updateSubjectMaterial(req: Request, res: Response) {
    const attachments = req.files;
    const body = req.body;
    const prisma = new PrismaClient();

    const materialTransaction = await prisma.$transaction(async trx => {
        const material = await trx.subjectMaterial.update({
            data: {
                title: body.title,
                content: body.content,
                subjectId: body.subjectId
            },
            where: {
                id: body.subjectMaterialId,
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

export async function scoreClasswork(req: Request, res: Response) {
    const body = req.body as {
        submissionId: number;
        score: number;
    };

    const prisma = new PrismaClient();

    const submissionTrans = await prisma.$transaction(async trx => {
        const submission = await trx.assignmentSubmission.update({
            where: {
                id: body.submissionId
            },
            data: {
                score: body.score
            }
        });

        const assignment = await trx.assignment.findUnique({ where: { id: submission.assignmentId } });

        console.log("Katung assignment", assignment);

        const matchedStudentGrade = await trx.studentGrade.findMany({ where: { referenceId: body.submissionId } });


        if (matchedStudentGrade.length == 0)
            await trx.studentGrade.create({
                data: {
                    title: assignment?.title,
                    studentId: submission.studentId,
                    teacherSubjectId: assignment?.teacherSubjectId!,
                    score: body.score,
                    category: "ACTIVITY",
                    hps: assignment?.hps ?? 0,
                    referenceId: body.submissionId
                }
            });

        else
            await trx.studentGrade.update({
                data: {
                    score: body.score
                },
                where: {
                    id: matchedStudentGrade[0].id
                }
            });

        return submission;
    });


    return res.status(200).json(submissionTrans);
}

export async function addTeacherToSubject(req: Request, res: Response) {
    const body = req.body as {
        subjectId: number;
        teacherId: number;
        schoolYearId?: number;
    };


    const prisma = new PrismaClient();



    let schoolYear: SchoolYear | null;

    if (!body.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: body.schoolYearId } });


    const matchedTeacher = await prisma.teacherSubject.findMany({
        where: {
            subjectId: body.subjectId,
            teacherId: body.teacherId,
            schoolYearId: schoolYear?.id
        }
    });

    if (matchedTeacher.length > 0)
        return res.status(400).json([
            {
                message: "Teacher already exists.",
                context: {
                    label: "teacherId"
                }
            }
        ] as Joi.ValidationErrorItem[]);

    const currentSchoolYear = await prisma.schoolYear.findMany({ where: { isCurrent: true } });

    const teacherSubject = await prisma.teacherSubject.create({
        data: {
            subjectId: body.subjectId,
            teacherId: body.teacherId,
            schoolYearId: currentSchoolYear[0].id
        }
    });

    return res.status(200).json(teacherSubject);
}

export async function enrollStudent(req: Request, res: Response) {
    const body = req.body as {
        studentId: number;
        teacherSubjectId: number;
    };

    const prisma = new PrismaClient();

    const enrollment = await prisma.studentEnrolledSubject.create({
        data: {
            studentId: body.studentId,
            teacherSubjectId: body.teacherSubjectId
        }
    });

    return res.status(200).json(enrollment);
}

export async function updateUser(req: Request, res: Response) {
    let {
        id,
        email,
        firstname,
        middlename,
        lastname,
        password,
        updatedById
    } = req.body as Partial<{
        id: number;
        email: string;
        firstname: string;
        middlename: string;
        lastname: string;
        password: string;
        updatedById: number;
    }>;


    const prisma = new PrismaClient();

    if (password)
        password = await argon.hash(password);

    const user = await prisma.user.update({
        data: {
            email,
            firstname,
            middlename,
            lastname,
            password: password ?? undefined
        }, where: {
            id: id
        }
    });

    // Add log
    await prisma.activityLog.create({
        data: {
            userId: updatedById!,
            text: `User profile updated: ${firstname} ${lastname}`
        }
    });


    return res.status(200).json(user);
}

export async function deleteMeeting(req: Request, res: Response) {
    const query = req.query;
    const code = query.code + "";

    const prisma = new PrismaClient();

    await prisma.meetingSession.update({
        data: { onGoing: false },
        where: { authCode: code }
    });

    return res.redirect(query.redirect_url + "");
}


const userSchema = Joi.object({
    firstname: Joi.string().required(),
    middlename: Joi.string().optional().allow(null),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'STUDENT', 'TEACHER').required()
});



export async function createUser(req: Request, res: Response) {
    const body = req.body as {
        firstname: string;
        middlename?: string;
        lastname: string;
        email: string;
        password: string;
        role: "ADMIN" | "STUDENT" | "TEACHER";
    };

    const { error } = userSchema.validate(body, { abortEarly: false });

    if (error)
        return res.status(400).json(error.details);

    const prisma = new PrismaClient();
    const matchedUser = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    });

    if (matchedUser)
        return res.status(400).json([
            {
                message: "Email already taken",
                context: {
                    label: "email",
                    key: "email"
                }
            }
        ] as Joi.ValidationErrorItem[]);

    body.password = await argon.hash(body.password);
    const user = await prisma.user.create({ data: body });

    return res.status(200).json(user);
}


export async function deleteMaterial(req: Request, res: Response) {
    const id = req.params.id;

    const prisma = new PrismaClient();
    const material = await prisma.subjectMaterial.delete({ where: { id: parseInt(id) } });

    return res.status(200).json(material);
}

export async function editQuiz(req: Request, res: Response) {
    const body = req.body as {
        quizId: number;
        title: string;
        questions: Question[];
    };
    const prisma = new PrismaClient();
    const matchedQuiz = await prisma.subjectMaterial.findUnique({ where: { id: body.quizId } });

    console.log(matchedQuiz);

    return res.status(200).json(body);
}

export async function editQuiz2(req: Request, res: Response) {
    const { quizId, title, questions }: { quizId: number; title: string; questions: Question[]; } = req.body;
    const prisma = new PrismaClient();

    try {
        // Start a transaction to ensure atomic operations (all-or-nothing)
        const result = await prisma.$transaction(async (tx) => {
            // Step 1: Update the quiz title (in SubjectMaterial)
            const quiz = await tx.subjectMaterial.update({
                where: { id: quizId },
                data: { title }, // Update the quiz title
            });

            // Step 2: Fetch the existing questions and answers related to this quiz
            const existingQuestions = await tx.question.findMany({
                where: { subjectMaterialId: quiz.id },
                include: {
                    answers: true, // Include the related answers
                },
            });

            // Step 3: Handle questions and answers (add, update, delete)
            for (const questionData of questions) {
                // Step 3.1: Update or create the question
                const question = await tx.question.upsert({
                    where: { id: parseInt(questionData.id) }, // Match the question by id
                    update: {
                        questionText: questionData.questionText,
                        type: questionData.type,
                    },
                    create: {
                        questionText: questionData.questionText,
                        type: questionData.type,
                        subjectMaterialId: quiz.id,
                    },
                });

                // Step 3.2: Handle answers (add, update, delete)
                for (const answerData of questionData.answers) {
                    await tx.answer.upsert({
                        where: { id: typeof answerData.id == "string" ? -1 : answerData.id }, // Use answer id if available
                        update: {
                            answerText: answerData.answerText,
                            isCorrect: answerData.correct,
                        },
                        create: {
                            answerText: answerData.answerText,
                            isCorrect: answerData.correct,
                            questionId: question.id,
                        },
                    });
                }
            }

            // Step 4: Delete any existing questions or answers that are not present in the request body
            // 4.1: Delete answers that are no longer present
            for (const existingQuestion of existingQuestions) {
                for (const existingAnswer of existingQuestion.answers) {
                    const answerExists = questions.some((q) =>
                        q.answers.some((a) => a.id === existingAnswer.id)
                    );

                    // If the answer is no longer in the request body, delete it
                    if (!answerExists) {
                        await tx.answer.delete({
                            where: { id: existingAnswer.id },
                        });
                    }
                }
            }

            // 4.2: Delete questions that are no longer present in the request body
            for (const existingQuestion of existingQuestions) {
                const questionExists = questions.some((q) => parseInt(q.id) === existingQuestion.id);

                // If the question is no longer in the request body, delete it
                if (!questionExists) {
                    await tx.question.delete({
                        where: { id: existingQuestion.id },
                    });
                }
            }

            return quiz; // Return the updated quiz as a response
        });

        // Send the updated quiz as a successful response
        res.status(200).json({ message: 'Quiz updated successfully', quiz: result });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ message: 'Error updating quiz' });
    }
}

const sectionSchema = Joi.object({
    classLevelId: Joi.number().required(),
    sectionName: Joi.string().required()
});

export async function addSection(req: Request, res: Response) {
    const body = req.body as {
        classLevelId: number;
        sectionName: string;
    };

    const { error } = sectionSchema.validate(body, { abortEarly: false });

    if (error)
        return res.status(400).json(error.details);

    const prisma = new PrismaClient();

    const matchedSection = await prisma.classSection.findMany({
        where: {
            classLevelId: body.classLevelId,
            sectionName: body.sectionName
        }
    });

    // check if section already exists
    if (matchedSection.length > 0)
        return res.status(400).json([
            {
                message: "Section already exists",
                context: {
                    key: "sectionName",
                    label: "sectionName"
                }
            }
        ] as Joi.ValidationErrorItem[]);


    const section = await prisma.classSection.create({
        data: body
    });

    return res.status(200).json(section);
}

const schoolYearSchema = Joi.object({
    yearStart: Joi.number().required(),
    yearEnd: Joi.number().required(),
    createdById: Joi.optional().allow(null)
});

export async function addSchoolYear(req: Request, res: Response) {
    const body = req.body as {
        createdById: number;
        yearStart: number;
        yearEnd: number;
    };


    const { error } = schoolYearSchema.validate(body, { abortEarly: false });

    if (error)
        return res.status(400).json(error.details);
    const prisma = new PrismaClient();

    const matchedSchoolYear = await prisma.schoolYear.findMany({
        where: {
            yearStart: body.yearStart,
            yearEnd: body.yearEnd
        }
    });

    if (matchedSchoolYear.length > 0)
        return res.status(400).json([
            {
                message: "School year already exists.",
                context: {
                    key: "yearStart",
                    label: "yearStart"
                }
            }
        ] as Joi.ValidationErrorItem[]);

    const schoolYear = await prisma.schoolYear.create({
        data: body
    });

    return res.status(200).json(schoolYear);
}

export async function changeCurrentSchoolYear(req: Request, res: Response) {
    const body = req.body as {
        adminId: number;
        adminPassword: string;
        schoolYearId: number;
        isCurrent: boolean;
    };

    const prisma = new PrismaClient();

    console.log(body);

    try {
        const schoolYear = await prisma.$transaction(async (tx) => {
            const admin = await tx.user.findUnique({ where: { id: body.adminId } });

            console.log(admin);
            if (!admin)
                throw new ErrorResponse(400, "");

            if (!(await argon.verify(admin.password, body.adminPassword)))
                throw new ErrorResponse(400, "Wrong password");

            await tx.schoolYear.updateMany({
                where: {
                    NOT: {
                        id: body.schoolYearId
                    }
                },
                data: {
                    // your update data here, for example:
                    isCurrent: false
                }
            });

            const schoolYear = await tx.schoolYear.update({
                where: { id: body.schoolYearId },
                data: { isCurrent: body.isCurrent }
            });

            return schoolYear;
        });

        return res.status(200).json(schoolYear);
    } catch (error) {

        console.log(error);

        if (error instanceof ErrorResponse)
            return res.status(error.status).json([
                {
                    message: error.message,
                    context: { label: "password" }
                }
            ] as Joi.ValidationErrorItem[]);

        return res.status(500).json(error);
    }
}

export async function unlockSchoolYear(req: Request, res: Response) {
    const schoolYearId = parseInt(req.params.id);
    const prisma = new PrismaClient();

    const matchedSchoolYear = await prisma.schoolYear.findUnique({ where: { id: schoolYearId } });

    const schoolYear = await prisma.schoolYear.update({
        where: { id: schoolYearId }, data: {
            unlocked: !matchedSchoolYear?.unlocked
        }
    });

    return res.status(200).json(schoolYear);
}


export async function enrollStudentToSection(req: Request, res: Response) {
    const body = req.body as {
        studentId: number;
        sectionId: number;
    };

    const prisma = new PrismaClient();


    const currentSchoolYear = (await prisma.schoolYear.findMany({
        where: {
            isCurrent: true
        }
    }))[0];

    const matchedEnrollment = await prisma.studentEnrolledSection.findMany({
        where: {
            studentId: body.studentId,
            classSectionId: body.sectionId,
            schoolYearId: currentSchoolYear.id
        }
    });

    if (matchedEnrollment.length > 0)
        return res.status(400).json([
            {
                message: "Student already enrolled",
                context: { label: "" }
            }
        ] as Joi.ValidationErrorItem[]);


    const studentSection = await prisma.studentEnrolledSection.create({
        data: {
            classSectionId: body.sectionId,
            schoolYearId: currentSchoolYear.id,
            studentId: body.studentId
        }
    });

    return res.status(200).json(studentSection);
}

export async function removeStudentFromSection(req: Request, res: Response) {
    const id = parseInt(req.params.id);

    const prisma = new PrismaClient();

    const enrollment = await prisma.studentEnrolledSection.update({
        where: { id: id },
        data: {
            deletedAt: new Date()
        }
    });

    return res.status(200).json(enrollment);
}

export async function assignTeacherSection(req: Request, res: Response) {
    const body = req.body as {
        teacherSubjectId: number;
        classSectionId: number;
        schoolYearId?: number;
    };

    const prisma = new PrismaClient();

    let schoolYear: SchoolYear | null;

    if (!body.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: body.schoolYearId } });


    const teachersubjectSection = await prisma.teacherSubjectSection.create({
        data: {
            ...body,
            schoolYearId: schoolYear!.id
        }
    });

    return res.status(200).json(teachersubjectSection);
}

export async function createAssignment(req: Request, res: Response) {
    const body = req.body as {
        title: string;
        instruction: string;
        hps: number;
        dueDate: string;
        teacherSubjectId: number;
    };

    const prisma = new PrismaClient();

    const assignment = await prisma.assignment.create({ data: body });

    return res.status(200).json(assignment);
}

export async function getStudentGrades(req: Request, res: Response) {
    const teacherSubjectId = req.params.id;

    const prisma = new PrismaClient();

    const teacherSection = await prisma.teacherSubject.findUnique({
        where: { id: parseInt(teacherSubjectId) }, include: {
            TeacherSubjectSection: {
                include: {
                    classSection: {
                        include: {
                            StudentEnrolledSection: {
                                include: {
                                    student: {
                                        include: {
                                            StudentGrade: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    console.log(teacherSection);

    return res.status(200).json(teacherSection);
}