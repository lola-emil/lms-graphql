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
        teacherSubjectSections(teacherSubjectId: Int!): [TeacherSubjectSection]
        teacherSubjectSection(id: Int!): TeacherSubjectSection
    }
`;


export const teacherSubjectSectionResolver = {
    Query: {
        teacherSubjectSections,
        teacherSubjectSection,
    }
};

async function teacherSubjectSections(_: any, args: { teacherSubjectId: number; }) {
    return prisma.teacherSubjectSection.findMany({
        where: { teacherSubjectId: args.teacherSubjectId }
    });
}

async function teacherSubjectSection(_: any, args: { id: number; }) {
    return prisma.teacherSubjectSection.findUnique({ where: { id: args.id } });
}