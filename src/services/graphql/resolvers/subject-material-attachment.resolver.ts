import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";



const prisma = new PrismaClient();

export const subjectMaterialAttachmentDefs = gql`

    type SubjectMaterialAttachment {
        id: Int
        filename: String
        fileURL: String
        subjectMaterialId: Int
    }

    type Query {
        subjectMaterialAttachments: [SubjectMaterialAttachment]
        subjectMaterialAttachment(id: Int!): SubjectMaterialAttachment
    }
`;

export const subjectMaterialAttachmentResolvers = {
    Query: {
        subjectMaterialAttachments: () => prisma.subjectMaterialAttachments.findMany(),
        subjectMaterialAttachment: (_: any, args: { id: number; }) => prisma.subjectMaterialAttachments.findUnique({ where: { id: args.id } })
    }
};
