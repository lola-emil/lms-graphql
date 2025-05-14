import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient();


export const subjectMaterialTypeDefs = gql`

    enum MaterialType {
        DOCUMENT
        QUIZ
        MD
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
    }

    type Query {
        subjectMaterials: [SubjectMaterial!]!,
        subjectMaterial(id: Int!): SubjectMaterial
    }

    type Mutation {
        createMaterial(title: String!, subjectId: Int!, materialType: MaterialType, fileURL: String, mdContentId: Int): SubjectMaterial!
    }
`;

export const subjectMaterialResolvers = {
    SubjectMaterial: {
        subject: async (parent: any) => {
            return await prisma.subject.findUnique({ where: { id: parent.subjectId } });
        },
        attachments: (parent: any) => {
            console.log(parent);
            return prisma.subjectMaterialAttachments.findMany({ where: { subjectMaterialId: parent.id } });
        }
    },
    Query: {
        subjectMaterials: async () => await prisma.subjectMaterial.findMany({
            include: {
                subject: true
            }
        }),
        subjectMaterial: async (_: any, args: { id: number; }) => await prisma.subjectMaterial.findUnique({ where: { id: args.id }, include: { subject: true } })
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
    return await prisma.subjectMaterial.create({ data: args });
}
