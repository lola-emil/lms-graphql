import { PrismaClient, SchoolYear } from "@prisma/client";
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

        studentGrades(studentId: Int!): [StudentGrade]
    }

    type Query {
        teacherSubjects(schoolYearId: Int): [TeacherSubject]
        teacherSubjectsPerTeacher(teacherId: Int!, schoolYearId: Int): [TeacherSubject]
        teacherSubject(id: Int!): TeacherSubject

        unassignedTeachers(subjectId: Int!, schoolYearId: Int): [User]
    }
`;


export const teacherSubjectResolvers = {
    TeacherSubject: {
        teacher: (parent: any) => prisma.user.findUnique({ where: { id: parent.teacherId } }),
        subject: (parent: any) => prisma.subject.findUnique({ where: { id: parent.subjectId } }),
        subjectMaterials: (parent: any) => prisma.subjectMaterial.findMany({ where: { teacherSubjectId: parent.id } }),
        schoolYear: (parent: any) => prisma.schoolYear.findUnique({ where: { id: parent.schoolYearId } }),
        studentGrades: (parent: any, args: { studentId: number; }) => prisma.studentGrade.findMany({ where: { teacherSubjectId: parent.id, studentId: args.studentId }, })
    },
    Query: {
        teacherSubjects,
        teacherSubject,
        unassignedTeachers,
        teacherSubjectsPerTeacher
    }
};


async function teacherSubjects(_: any, args: { schoolYearId?: number; }) {
    let matchedSchoolYear: SchoolYear | null;

    if (!args.schoolYearId)
        matchedSchoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        matchedSchoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });

    return prisma.teacherSubject.findMany({
        where: {
            schoolYearId: args.schoolYearId ?? matchedSchoolYear?.id
        }
    });
}


async function teacherSubject(_: any, args: { id: number; }) {
    return prisma.teacherSubject.findUnique({ where: { id: args.id } });
}

async function unassignedTeachers(_: any, args: { subjectId: number; schoolYearId?: number; }) {

    let schoolYear: SchoolYear | null;

    if (!args.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });

    const teacherSubjects = await prisma.teacherSubject.findMany({ where: { subjectId: args.subjectId, schoolYearId: schoolYear?.id } });
    const teacherIds = teacherSubjects.map(val => val.teacherId);
    const teachers = await prisma.user.findMany({
        where: {
            id: { notIn: teacherIds },
            role: "TEACHER"
        }
    });

    return teachers;
}

async function teacherSubjectsPerTeacher(_: any, args: { teacherId: number; schoolYearId?: number; }) {
    let schoolYear: SchoolYear | null;

    if (!args.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });


    return prisma.teacherSubject.findMany({ where: { teacherId: args.teacherId, schoolYearId: schoolYear?.id } });
}