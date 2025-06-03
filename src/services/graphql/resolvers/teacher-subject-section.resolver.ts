import { PrismaClient, SchoolYear } from "@prisma/client";
import gql from "graphql-tag";



const prisma = new PrismaClient();


export const teacherSubjectSectionTypeDefs = gql`
    type TeacherSubjectSection {
        id: Int

        teacherSubjectId: Int
        classSectionId: Int

        schoolYearId: Int

        createdAt: String
        updatedAt: String

        teacherSubject: TeacherSubject
        classSection: ClassSection
    }

    type Query {
        teacherSubjectSections(schoolYearId: Int): [TeacherSubjectSection]
        teacherSubjectSectionsPerTeacher(teacherSubjectId: Int!): [TeacherSubjectSection]
        teacherSubjectSectionsPerSection(sectionId: Int!, schoolYearId: Int): [TeacherSubjectSection],
        teacherSubjectSection(id: Int!): TeacherSubjectSection
    }
`;


export const teacherSubjectSectionResolver = {
    TeacherSubjectSection: {
        classSection: (parent: any) => prisma.classSection.findUnique({ where: { id: parent.classSectionId } }),
        teacherSubject: (parent: any) => prisma.teacherSubject.findUnique({ where: { id: parent.teacherSubjectId } })
    },
    Query: {
        teacherSubjectSections,
        teacherSubjectSection,
        teacherSubjectSectionsPerTeacher,
        teacherSubjectSectionsPerSection
    }
};

async function teacherSubjectSections(_: any, args: { schoolYearId?: number; }) {
    let schoolYear: SchoolYear | null;

    if (!args.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });

    return prisma.teacherSubjectSection.findMany({ where: { schoolYearId: schoolYear?.id } });
}

async function teacherSubjectSection(_: any, args: { id: number; }) {
    return prisma.teacherSubjectSection.findUnique({ where: { id: args.id } });
}

async function teacherSubjectSectionsPerTeacher(_: any, args: { teacherSubjectId: number; }) {
    console.log(args);
    return prisma.teacherSubjectSection.findMany({
        where: { teacherSubjectId: args.teacherSubjectId }
    });
}

async function teacherSubjectSectionsPerSection(_: any, args: { sectionId: number; schoolYearId?: number; }) {
    let schoolYear: SchoolYear | null;

    if (!args.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });

    return prisma.teacherSubjectSection.findMany({
        where: {
            classSectionId: args.sectionId,
            schoolYearId: schoolYear?.id
        }
    });
}