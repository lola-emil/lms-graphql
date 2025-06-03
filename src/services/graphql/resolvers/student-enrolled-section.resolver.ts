import { PrismaClient, SchoolYear } from "@prisma/client";
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
        studentEnrolledSections(sectionId: Int!, schoolYearId: Int): [StudentEnrolledSection]
        studentCurrentEnrolledSection(studentId: Int!, schoolYearId: Int): [StudentEnrolledSection],
        unEnrolledStudents(schoolYearId: Int): [User]
    }

`;

export const studentEnrolledSectionResolver = {
    StudentEnrolledSection: {
        student: (parent: any) => prisma.user.findUnique({ where: { id: parent.studentId } }),
        classSection: (parent: any) => prisma.classSection.findUnique({ where: { id: parent.classSectionId } })
    },
    Query: {
        studentCurrentEnrolledSection,
        studentEnrolledSections,
        unEnrolledStudents
    }
};


async function studentEnrolledSections(_: any, args: { sectionId: number; schoolYearId?: number; }) {
    let schoolYear: SchoolYear | null;

    if (!args.schoolYearId)
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    else
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });

    return await prisma.studentEnrolledSection.findMany({
        where: {
            classSectionId: args.sectionId,
            schoolYearId: schoolYear?.id
        }
    });
}


async function studentCurrentEnrolledSection(_: any, args: { studentId: number, schoolYearId?: number; }) {
    let { schoolYearId, studentId } = args;

    if (!schoolYearId)
        schoolYearId = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0].id;

    return await prisma.studentEnrolledSection.findMany({ where: { studentId, schoolYearId: schoolYearId } });
}

async function unEnrolledStudents(_: any, args: { schoolYearId?: number; }) {
    let schoolYear: SchoolYear | null;

    if (args.schoolYearId) {
        schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });
    } else {
        schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
    }


    const studentEnrollments = await prisma.studentEnrolledSection.findMany({
        where: {
            schoolYearId: schoolYear?.id
        }
    });

    const enrolledStudentIds = studentEnrollments.map(val => val.studentId);

    const students = await prisma.user.findMany({
        where: {
            role: "STUDENT",
            NOT: {
                id: {
                    in: enrolledStudentIds
                }
            }
        }
    });

    return students;
}
