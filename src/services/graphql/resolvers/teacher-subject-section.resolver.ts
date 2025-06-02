import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";



const prisma = new PrismaClient();


export const teacherSubjectSectionTypeDefs = gql`
    type TeacherSubjectSection {
        id: Int

        teacherSubjectId: Int
        classSectionId: Int

        createdAt: String
        updatedAt: String

        teacherSubject: TeacherSubject
        classSection: ClassSection
    }

    type Query {
        teacherSubjectSections: [TeacherSubjectSection]
        teacherSubjectSectionsPerTeacher(teacherSubjectId: Int!): [TeacherSubjectSection]
        teacherSubjectSectionsPerSection(sectionId: Int!): [TeacherSubjectSection],
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

async function teacherSubjectSections(_: any) {
    return prisma.teacherSubjectSection.findMany();
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

async function teacherSubjectSectionsPerSection(_: any, args: { sectionId: number; }) {
    return prisma.teacherSubjectSection.findMany({where: {
        classSectionId: args.sectionId
    }})
 }