import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const studentGradeDefs = gql`

    enum GradeCategory {
        QUIZ
        ACTIVITY
    }

    type StudentGrade {
        id: Int
        studentId: Int
        teacherSubjectId: Int
        category: GradeCategory

        title: String
        hps: Float

        score: Float

        createdAt: String
        updatedAt: String

        student: User
        teacherSubject: TeacherAssignedSubject
    }

    type GradeOverview {
        score: Int
        hps: Int
        subject: String
    }

    type Query {
        studentGrades(studentId: Int!): [StudentGrade]
        gradePerSubject(teacherSubjectId: Int!): [StudentGrade]
        gradeOverview(studentId: Int!): [GradeOverview]
    }
`;

export const studentGradeResolver = {
    Query: {
        studentGrades: (_: any, args: { studentId: number; }) => prisma.studentGrade.findMany({ where: { studentId: args.studentId } }),
        gradePerSubject: (_: any, args: { teacherSubjectId: number; }) => prisma.studentGrade.findMany({ where: { teacherSubjectId: args.teacherSubjectId } }),
        gradeOverview: async (_: any, args: { studentId: number; }) => {
            const sum = await prisma.studentGrade.groupBy({
                by: ["teacherSubjectId", "category"],
                where: {
                    studentId: args.studentId
                },
                _sum: {
                    score: true,
                    hps: true,
                }
            });

            console.log(sum);

            const result: {
                hps: number;
                score: number;
                subject: string;
            }[] = [];

            for (let i = 0; i < sum.length; i++) {
                let item = sum[i];

                let matchedSubject = await prisma.teacherAssignedSubject.findUnique({
                    where: {
                        id: item.teacherSubjectId
                    },
                    include: {
                        subject: true
                    }
                });

                result.push({
                    hps: item._sum.hps?.toNumber() ?? 0,
                    score: item._sum.hps?.toNumber() ?? 0,
                    subject: matchedSubject?.subject.title ?? ""
                });
            }

            return result;
        }
    },
    StudentGrade: {
        student: (parent: any) => prisma.user.findUnique({ where: { id: parent.studentId } }),
        teacherSubject: (parent: any) => prisma.teacherAssignedSubject.findUnique({ where: { id: parent.teacherSubjectId } }),
    }
};