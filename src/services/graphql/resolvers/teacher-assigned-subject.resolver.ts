import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();


export const teacherSubjectTypeDef = gql`
    type TeacherAssignedSubject {
        id: Int!
        teacherId: Int!
        subjectId: Int!
        schoolYearId: Int!

        createdAt: String!
        updatedAt: String!

        teacher: User!
        subject: Subject!
        schoolYear: SchoolYear!
        studentEnrolledSubjects: [StudentEnrolledSubject!]!
    }

    type Query {
        teacherAssignedSubjects: [TeacherAssignedSubject!]!
        teacherAssignedSubject(id: Int): TeacherAssignedSubject
        teacherAssignedSubjectsByTeacherId(teacherId: Int!): [TeacherAssignedSubject!]! 
    }

    type Mutation {
        assignSubject(teacherId: Int!, subjectId: Int!, schoolYearId: Int!): TeacherAssignedSubject
    }
`;

export const teacherSubjectResolvers = {
    TeacherAssignedSubject: {
        subject: (parent: any) => prisma.subject.findUnique({ where: { id: parent.subjectId } }),
        studentEnrolledSubjects,
        schoolYear,
        teacher: (parent: any) => prisma.user.findUnique({ where: { id: parent.teacherId } })
    },
    Query: {
        teacherAssignedSubjects: () => prisma.teacherAssignedSubject.findMany({ include: { subject: true, teacher: true } }),
        teacherAssignedSubject: (_: any, args: { id: number; }) => prisma.teacherAssignedSubject.findUnique({ where: { id: args.id }, include: { subject: true, teacher: true } }),
        teacherAssignedSubjectsByTeacherId: (_: any, args: { teacherId: number; }) => prisma.teacherAssignedSubject.findMany({ where: { teacherId: args.teacherId } }),
    },
    Mutation: {
        assignSubject
    }
};

type Args = {
    teacherId: number,
    subjectId: number,
    schoolYearId: number,
};


async function studentEnrolledSubjects(parent: any) {
    return await prisma.studentEnrolledSubject.findMany({
        where: {
            teacherSubjectId: parent.id
        }
    });
}

async function schoolYear(parent: any) {
    return await prisma.schoolYear.findUnique({ where: { id: parent.schoolYearId } });
}

async function assignSubject(_: any, args: Args) {
    return await prisma.teacherAssignedSubject.create({ data: args });
}