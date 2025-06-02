import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();


export const teacherSubjectTypeDef = gql`
    type TeacherSubject {
        id: Int

        subjectId: Int
        teacherId: Int

        schoolYearId: Int

        createdAt: String
        updatedAt: String

        subjectMaterials: [SubjectMaterial]
        subject: Subject
        teacher: User
        schoolYear: SchoolYear
    }

    type Query {
        teacherSubjects: [TeacherSubject]
        teacherSubjectsPerTeacher(teacherId: Int!): [TeacherSubject]
        teacherSubject(id: Int!): TeacherSubject

        unassignedTeachers(subjectId: Int!): [User]
    }
`;


export const teacherSubjectResolvers = {
    TeacherSubject: {
        teacher: (parent: any) => prisma.user.findUnique({ where: { id: parent.teacherId } }),
        subject: (parent: any) => prisma.subject.findUnique({ where: { id: parent.subjectId } }),
        subjectMaterials: (parent: any) => prisma.subjectMaterial.findMany({ where: { teacherSubjectId: parent.id } }),
        schoolYear: (parent: any) => prisma.schoolYear.findUnique({where: {id: parent.schoolYearId}})
    },
    Query: {
        teacherSubjects,
        teacherSubject,
        unassignedTeachers,
        teacherSubjectsPerTeacher
    }
};


async function teacherSubjects(_: any) {
    return prisma.teacherSubject.findMany();
}


async function teacherSubject(_: any, args: { id: number; }) {
    return prisma.teacherSubject.findUnique({ where: { id: args.id } });
}

async function unassignedTeachers(_: any, args: { subjectId: number; }) {
    const teacherSubjects = await prisma.teacherSubject.findMany({ where: { subjectId: args.subjectId } });
    const teacherIds = teacherSubjects.map(val => val.teacherId);

    const teachers = await prisma.user.findMany({
        where: {
            id: { notIn: teacherIds },
            role: "TEACHER"
        }
    });

    return teachers;
}

async function teacherSubjectsPerTeacher(_: any, args: { teacherId: number; }) {
    return prisma.teacherSubject.findMany({ where: { teacherId: args.teacherId } });
}