import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();


export const teacherSubjectTypeDef = gql`
    type TeacherSubject {
        id: Int

        subjectId: Int
        teacherId: Int


        createdAt: String
        updatedAt: String

        subject: Subject
        teacher: User
    }

    type Query {
        teacherSubjects(teacherId: Int!): [TeacherSubject]
        teacherSubject(id: Int!): TeacherSubject
    }
`;


export const teacherSubjectResolvers = {
    Query: {
        teacherSubjects,
        teacherSubject
    }
};


async function teacherSubjects(_: any, args: { teacherId: number; }) {
    return prisma.teacherSubject.findMany({ where: { teacherId: args.teacherId } });
}


async function teacherSubject(_: any, args: { id: number; }) {
    return prisma.teacherSubject.findUnique({ where: { id: args.id } });
}