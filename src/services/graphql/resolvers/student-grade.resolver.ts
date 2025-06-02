import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const studentGradeDefs = gql`

    enum GradeCategory {
        QUIZ
        ACTIVITY
        EXAM
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
        teacherSubject: TeacherSubject
    }

    type GradeOverview {
        score: Int
        hps: Int
        subject: String
    }

    type Query {
        studentGrades(studentId: Int!): [StudentGrade]
        gradePerSubject(teacherSubjectId: Int!): [StudentGrade]
        gradeOverview(studentId: Int!): [StudentGrade]
    }
`;

export const studentGradeResolver = {
    Query: {
        studentGrades: (_: any, args: { studentId: number; }) => prisma.studentGrade.findMany({ where: { studentId: args.studentId } }),
        gradePerSubject: (_: any, args: { teacherSubjectId: number; }) => prisma.studentGrade.findMany({ where: { teacherSubjectId: args.teacherSubjectId } }),
        gradeOverview: async (_: any, args: { studentId: number; }) => {
            // const sum = await prisma.studentGrade.groupBy({
            //     by: ["teacherSubjectId", "category"],
            //     where: {
            //         studentId: args.studentId
            //     },
            //     _sum: {
            //         score: true,
            //         hps: true,
            //     }
            // });

            const kuan = await prisma.studentGrade.findMany({
                where: {
                    studentId: args.studentId
                },
            });

            return kuan;
        }
    },
    StudentGrade: {
        student: (parent: any) => prisma.user.findUnique({ where: { id: parent.studentId } }),
        teacherSubject: (parent: any) => prisma.teacherAssignedSubject.findUnique({ where: { id: parent.teacherSubjectId } }),
    }
};