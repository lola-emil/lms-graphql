import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient;

export const studentEnrolledSectionTypeDef = gql`
    type StudentEnrolledSection {
        id: Int

        studentId: Int

        classSectionId: Int
        
        schoolYearId: Int

        createdAt: String
        updatedAt: String

        student: User
        classSection: ClassSection
        schoolYear: SchoolYear
    }

    type Query {
        studentEnrolledSections: [StudentEnrolledSection]
        studentCurrentEnrolledSection(studentId: Int!, schoolYearId: Int!): [StudentEnrolledSection]
    }

`;

export const studentEnrolledSectionResolver = {
    Query: {
        studentCurrentEnrolledSection,
        studentEnrolledSections
    }
};


async function studentEnrolledSections(_: any) {
    return await prisma.studentEnrolledSection.findMany();
}


async function studentCurrentEnrolledSection(_: any, args: { studentId: number, schoolYearId: number; }) {
    const { schoolYearId, studentId } = args;
    return await prisma.studentEnrolledSection.findMany({ where: { studentId, schoolYearId } });
}
