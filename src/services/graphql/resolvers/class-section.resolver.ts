import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";



const prisma = new PrismaClient();

export const classSectionTypeDefs = gql`
    type ClassSection {
        id: Int!
        sectionName: String!
        classLevelId: Int!

        createdAt: String
        updatedAt: String

        classLevel: ClassLevel
        teacherSubjectSection: [TeacherSubjectSection]
    }

    type Query {
        classSections: [ClassSection!]!
        classSectionsPerLevel(classLevelId: Int!): [ClassSection]
        classSection(id: Int!): ClassSection
    }

    type Mutation {
        createSection(sectionName: String!, classLevelId: Int!): ClassSection
    }
`;

export const classSectionResolvers = {
    ClassSection: {
        classLevel: (parent: any) => prisma.classLevel.findUnique({ where: { id: parent.classLevelId } }),
        teacherSubjectSection: (parent: any) => prisma.teacherSubjectSection.findMany({ where: { classSectionId: parent.id } })
    },
    Query: {
        classSections: () => prisma.classSection.findMany(),
        classSectionsPerLevel: (_: any, args: { classLevelId: number; }) => prisma.classSection.findMany({ where: { classLevelId: args.classLevelId } }),
        classSection: (_: any, args: { id: number; }) => prisma.classSection.findUnique({ where: { id: args.id } })
    },

    Mutation: {
        createSection
    }
};

type Args = {
    sectionName: string;
    classLevelId: number;
};

async function createSection(_: any, args: any) {
    const result = await prisma.classSection.create({ data: args });
    return result;
}