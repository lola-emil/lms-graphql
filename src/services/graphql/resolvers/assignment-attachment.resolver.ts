import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const assignmentAttachmentTypeDefs = gql`
    type AssignmentAttachment {
        id: Int!

        fileURL: String!

        assignmentId: Int!

        assignment: Assignment!
    }

    type Query {
        assignmentAttachments: [AssignmentAttachment!]!,
        assignmentAttachment(id: Int!): AssignmentAttachment!
    }

    type Mutation {
        createAssignmentAttachment(fileURL: String!, assignmentId: Int!): AssignmentAttachment
    }
`;

export const assignmentAttachmentResolvers = {
    AssignmentAttachment: {
        assignment: (parent: any) => prisma.assignment.findUnique({ where: { id: parent.assignmentId } })
    },
    Query: {
        assignmentAttachments: () => prisma.assignmentAttachment.findMany(),
        assignmentAttachment: (_: any, args: { id: number; }) => prisma.assignmentAttachment.findUnique({ where: { id: args.id } })
    },
    Mutation: {
        createAssignmentAttachment
    }
};

async function createAssignmentAttachment(_: any, args: { fileURL: string, assignmentId: number; }) {
    return await prisma.assignmentAttachment.create({ data: args });
}