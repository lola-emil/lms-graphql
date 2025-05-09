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
        description: String!
        subjectId: Int!

        materialType: MaterialType
        fileURL: String

        mdContentId: Int

        createdAt: String!
        updatedAt: String!

        subject: Subject!
    }

    type Query {
        subjectMaterials: [SubjectMaterial!]!,
        subjectMaterial(id: Int!): SubjectMaterial
    }

    type Mutation {
        createMaterial(description: String!, subjectId: Int!): SubjectMaterial!
    }
`;

export const subjectMaterialResolvers = {
    SubjectMaterial: {
        subject: async (parent: any) => {
            return await prisma.subject.findUnique({ where: { id: parent.subjectId } });
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
    description: string;
    subjectId: number;
};


async function createMaterial(_: any, args: Args) {
    return await prisma.subjectMaterial.create({ data: args });
}
