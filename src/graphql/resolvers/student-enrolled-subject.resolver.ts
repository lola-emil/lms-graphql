import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient();


export const studentEnrolledSubjectTypeDefs = gql`
    type StudentEnrolledSubject {
        id: Int!
        studentId: Int!
        teacherSubjectId: Int!

        createdAt: String!
        updatedAt: String!

        student: User!
        teacherSubject: TeacherAssignedSubject!
    }

    type Query {
        studentEnrolledSubjects: [StudentEnrolledSubject!]!,
        studentEnrolledSubject: StudentEnrolledSubject!
    }

    type Mutation {
        enrollSubjectToStudent(studentId: Int!, teacherSubjectId: Int!): StudentEnrolledSubject!
    }
`;

export const studentEnrolledSubjectResolvers = {
    StudentEnrolledSubject: {
        student: (parent: any) => prisma.user.findUnique({ where: { id: parent.studentId } }),
        teacherSubject: (parent: any) => prisma.teacherAssignedSubject.findUnique({ where: { id: parent.teacherSubjectId } })
    },
    Query: {
        studentEnrolledSubjects: () => prisma.studentEnrolledSubject.findMany(),
        studentEnrolledSubject: (_: any, args: { id: number; }) => prisma.studentEnrolledSubject.findUnique({ where: { id: args.id } })
    },

    Mutation: {
        async enrollSubjectToStudent(_: any, args: { studentId: number, teacherSubjectId: number; }) {
            return await prisma.studentEnrolledSubject.create({ data: args });
        }
    }
};