import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const assignmentSubmissionTypeDefs = gql`
    type AssignmentSubmission {
        id: Int!

        title: String
        comment: String

        assignmentId: Int!
        studentId: Int!

        score: Float

        createdAt: String
        updatedAt: String

        assignment: Assignment!
        student: User!

        attachments: [AssignmentSubmissionAttachment]

        feedback: [AssignmentFeedback]
    }

    type AssignmentSubmissionAttachment {
        id: Int!
        fileURL: String!
        assignmentSubmissionId: Int!

        assignmentSubmission: AssignmentSubmission
    }

    type Query {
        assignmentSubmissions(assignmentId: Int!): [AssignmentSubmission!]!
        studentAssignmentSubmissions(studentId: Int!): [AssignmentSubmission]
        assignmentSubmission(id: Int!): AssignmentSubmission
        assignmentSubmissionAttachments(submissionId: Int!): [AssignmentSubmissionAttachment!]!
        assignmentSubmissionAttachment(id: Int!): AssignmentSubmissionAttachment!
    }

    type Mutation {
        createAssignmentSubmission(
            title: String
            comment: String
            assignmentId: Int!
            studentId: Int!
        ): AssignmentSubmission!

        updateAssignmentSubmission(
            id: Int!
            title: String
            comment: String
        ): AssignmentSubmission!

        deleteAssignmentSubmission(id: Int!): Boolean!

        createAssignmentSubmissionAttachment(
            assignmentSubmissionId: Int!
            fileURL: String!
        ): AssignmentSubmissionAttachment!

        deleteAssignmentSubmissionAttachment(id: Int!): Boolean!
    }
`;

export const assignmentSubmissionResolvers = {
    AssignmentSubmission: {
        assignment: (parent: any) => prisma.assignment.findUnique({ where: { id: parent.assignmentId } }),
        student: (parent: any) => prisma.user.findUnique({ where: { id: parent.studentId } }),
        feedback: async (parent: any) => {
            const result = await prisma.assignmentFeedback.findMany({ where: { studentSubmissionId: parent.id } });
            return result;
        },
        attachments: (parent: any) => prisma.assignmentSubmissionAttachment.findMany({ where: { assignmentSubmissionId: parent.id } })
    },
    Query: {
        assignmentSubmissions: (_: any, args: { assignmentId: number; }) => prisma.assignmentSubmission.findMany({ where: { assignmentId: args.assignmentId } }),
        studentAssignmentSubmissions: (_: any, args: { studentId: number; }) => {
            return prisma.assignmentSubmission.findMany({ where: { studentId: args.studentId } });
        },
        assignmentSubmission: (_: any, args: { id: number; }) =>
            prisma.assignmentSubmission.findUnique({
                where:
                {
                    id: args.id
                }
            }),
        assignmentSubmissionAttachments: (_: any, args: { submissionId: number; }) =>
            prisma.assignmentSubmissionAttachment.findMany({
                where:
                {
                    assignmentSubmissionId: args.submissionId
                }
            }),
        assignmentSubmissionAttachment: (_: any, args: { id: number; }) => prisma.assignmentSubmissionAttachment.findUnique({
            where: {
                id: args.id
            }
        })
    },
    Mutation: {
        async createAssignmentSubmission(_: any, args: { title?: string, comment?: string, assignmentId: number; studentId: number; }) {
            return await prisma.assignmentSubmission.create({
                data: args
            });
        },

        // async updateAssignmentSubmission(_: any, args: { title: string, comment: string, assignmentId: number; }) {

        // },

        async createAssignmentSubmissionAttachment(_: any, args: { assignmentSubmissionId: number, fileURL: string; }) {
            return await prisma.assignmentSubmissionAttachment.create({ data: args });
        }
    }
};  