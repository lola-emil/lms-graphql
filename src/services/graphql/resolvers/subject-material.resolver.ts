import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient();


export const subjectMaterialTypeDefs = gql`

    enum MaterialType {
        MODULE
        QUIZ
    }
    
    type SubjectMaterial {
        id: Int!
        title: String
        subjectId: Int!

        materialType: MaterialType

        content: String
        createdAt: String!
        updatedAt: String!

        subject: Subject!

        attachments: [SubjectMaterialAttachment]

        questions: [Question]

        quizSessions: [QuizSession!]
    }

    type Query {
        subjectMaterials: [SubjectMaterial!]!,
        subjectMaterial(id: Int!): SubjectMaterial,
        quizzes: [SubjectMaterial]
        quiz(id: Int!): SubjectMaterial
        materialCount: Int
    }

    type Mutation {
        createMaterial(title: String!, subjectId: Int!, materialType: MaterialType, fileURL: String, mdContentId: Int): SubjectMaterial!
        # createQuiz(title: String!, subjectId: Int!, questions: [Question!]!): SubjectMaterial!
    }
`;

export const subjectMaterialResolvers = {
    SubjectMaterial: {
        subject: async (parent: any) => {
            return await prisma.subject.findUnique({ where: { id: parent.subjectId } });
        },
        attachments: (parent: any) => {
            return prisma.subjectMaterialAttachments.findMany({ where: { subjectMaterialId: parent.id } });
        },
        questions: (parent: any) => {
            return prisma.question.findMany({ where: { subjectMaterialId: parent.id } });
        },
        quizSessions: (parent: any) => {
            return prisma.quizSession.findMany({ where: { quizId: parent.id } });
        }
    },
    Query: {
        subjectMaterials: async () => await prisma.subjectMaterial.findMany({
            include: {
                subject: true
            }
        }),
        subjectMaterial: async (_: any, args: { id: number; }) => await prisma.subjectMaterial.findUnique({ where: { id: args.id }, include: { subject: true } }),
        quizzes: async (parent: any) => await prisma.subjectMaterial.findMany({ where: { materialType: "QUIZ" } }),
        quiz: async (_: any, args: { id: number; }) => {
            return await prisma.subjectMaterial.findUnique({ where: { id: args.id } });
        },
        materialCount: (_: any) => prisma.subjectMaterial.count()
    },
    Mutation: {
        createMaterial
    }
};

type Args = {
    title: string;
    subjectId: number;
};


async function createMaterial(_: any, args: Args) {
    return await prisma.subjectMaterial.create({
        data: {
            ...args,
            materialType: "MODULE"
        }
    });
}
