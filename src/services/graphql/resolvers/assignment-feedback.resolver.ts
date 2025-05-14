import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const assignmentFeedbackDefs = gql`
    type AssignmentFeedback {
        id: Int!
        comment: String
        mark: Float!
        studentSubmissionId: Int!
        teacherId: Int!

        createdAt: String
        updatedAt: String

        teacher: User
    }
    
    type Query {
        assignmentFeedbacks: [AssignmentFeedback]
        assignmentFeedback(id: Int!): AssignmentFeedback
        feedbackFromSubmission(submissionid: Int!): [AssignmentFeedback] 
    }


    type Mutation {
        createFeedback(comment: String, mark: Float!, studentSubmissionId: Int!, teacherId: Int!): AssignmentFeedback
    }
`;

export const assignmentFeedbackResolvers = {
    AssignmentFeedback: {
        teacher: (parent: any) => prisma.user.findUnique({ where: { id: parent.teacherId } })
    },
    Query: {
        assignmentFeedbacks: () => prisma.assignmentFeedback.findMany(),
        assignmentFeedback: (_: any, args: { id: number; }) => prisma.assignmentFeedback.findUnique({ where: { id: args.id } }),
        feedbackFromSubmission: (_: any, args: { submissionid: number; }) => prisma.assignmentFeedback.findMany({ where: { studentSubmissionId: args.submissionid } })
    },
    Mutation: {
        createFeedback
    }
};

async function createFeedback(_: any, args: {
    comment?: string;
    mark: number;
    studentSubmissionId: number;
    teacherId: number;
}) {
    return prisma.assignmentFeedback.create({ data: args });
}