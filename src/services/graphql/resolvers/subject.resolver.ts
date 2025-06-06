import { PrismaClient, SchoolYear } from "@prisma/client";
import gql from "graphql-tag";
import path from "path";
import fs from "fs";


const prisma = new PrismaClient();


export const subjectTypDefs = gql`
    type Subject {  
        id: Int!
        title: String!

        coverImgUrl: String
        classLevelId: Int!

        createdAt: String!
        updatedAt: String!

        teacherSubjects(schoolYearId: Int): [TeacherSubject!]!

        gradeLevel: ClassLevel
    }

    type Query {
        subjects(offset: Int, limit: Int): [Subject!]!
        subject(id: Int!): Subject!
        subjectPerLevel(classLevelId: Int!): [Subject]
    }
`;

export const subjectResolvers = {
    Subject: {
        teacherSubjects: async (parent: any, args: { schoolYearId?: number; }) => {
            let schoolYear: SchoolYear | null;

            if (!args.schoolYearId)
                schoolYear = (await prisma.schoolYear.findMany({ where: { isCurrent: true } }))[0];
            else
                schoolYear = await prisma.schoolYear.findUnique({ where: { id: args.schoolYearId } });
            
            return await prisma.teacherSubject.findMany({ where: { subjectId: parent.id, schoolYearId: schoolYear?.id } });
        },

        gradeLevel: async (parent: any) => prisma.classLevel.findUnique({ where: { id: parent.classLevelId } })
    },
    Query: {
        subjects: async (_: any, args: { offset: number, limit: number; }) => {
            const { offset = 0, limit = 10 } = args;

            const subjects = await prisma.subject.findMany({
                skip: offset,
                take: limit,
                // orderBy: { createdAt: "desc" }
            });

            return subjects;
        },

        subject: (_: any, args: { id: number; }) =>
            prisma.subject.findUnique({
                where: {
                    id: args.id
                },
                include: {
                    TeacherAssignedSubject: true,
                    SubjectMaterial: true
                }
            }),
        subjectPerLevel: (_: any, args: { classLevelId: number; }) => prisma.subject.findMany({
            where: { classLevelId: args.classLevelId }
        })
    },

};
