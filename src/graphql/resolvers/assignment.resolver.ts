import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const assignmentTypeDefs = gql`
    type Assignment {
        id: Int!
        title: String!
        instructions: String

        teacherAssignedSubjectId: Int!

        teacherAssignedSubject: TeacherAssignedSubject!,
        assignmentAttachments: [AssignmentAttachment!]!
    }

    type Query {
        assignments: [Assignment!]!,
        assignment: Assignment!
    }

    type Mutation {
        createAssignment(title: String!, instructions: String, teacherAssignedSubjectId: Int!): Assignment!
    }
`;

export const assignemtResolvers = {
    Assignment: {
        assignmentAttachments: (parent: any) => prisma.assignmentAttachment.findMany({ where: { assignmentId: parent.id } }),
        teacherAssignedSubject: (parent: any) => prisma.teacherAssignedSubject.findUnique({ where: { id: parent.teacherAssignedSubjectId } })
    },
    Query: {
        assignments: () => prisma.assignment.findMany(),
        assignment: (_: any, args: { id: number; }) => prisma.assignment.findUnique({ where: { id: args.id } })
    },
    Mutation: {
        createAssignment
    }
};

type Args = {
    title: string;
    instruction: string;
    teacherAssignedSubjectId: number;
};

async function createAssignment(_: any, args: Args) {
    return await prisma.assignment.create({ data: args });
}