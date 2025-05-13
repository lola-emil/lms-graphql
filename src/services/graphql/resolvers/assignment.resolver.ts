import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import { DateTimeResolver } from "graphql-scalars";
import Joi from "joi";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

export const assignmentTypeDefs = gql`
    scalar DateTime

    type Assignment {
        id: Int!
        title: String!
        instructions: String

        teacherAssignedSubjectId: Int!

        dueDate: DateTime

        hps: Float

        createdAt: DateTime
        updatedAt: DateTime

        teacherAssignedSubject: TeacherAssignedSubject!
        assignmentAttachments: [AssignmentAttachment!]!


        assignmentSubmissions: [AssignmentSubmission]
    }

    type Query {
        assignments(teacherSubjectId: Int!): [Assignment!]!,
        assignment: Assignment!
    }

    type Mutation {
        createAssignment(title: String!, instructions: String, teacherAssignedSubjectId: Int!, hps: Float, dueDate: DateTime ): Assignment!
    }
`;

export const assignemtResolvers = {
    DateTime: DateTimeResolver,
    Assignment: {
        assignmentAttachments: (parent: any) => prisma.assignmentAttachment.findMany({ where: { assignmentId: parent.id } }),
        teacherAssignedSubject: (parent: any) => prisma.teacherAssignedSubject.findUnique({ where: { id: parent.teacherAssignedSubjectId } }),
        assignmentSubmissions: (parent: any) => prisma.assignmentSubmission.findMany({ where: { assignmentId: parent.id }, orderBy: { createdAt: "desc" } })
    },
    Query: {
        assignments: (_: any, args: { teacherSubjectId: number; }) => prisma.assignment.findMany({
            where: {
                teacherAssignedSubjectId: args.teacherSubjectId
            },
            orderBy: {
                createdAt: "desc"
            }
        }),
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

const assignmentSchema = Joi.object({
    title: Joi.string().required(),
    instructions: Joi.string().optional(),
    teacherAssignedSubjectId: Joi.number().integer().required(),
    dueDate: Joi.date().iso().required(),
    hps: Joi.number().precision(2).optional(),
});

async function createAssignment(_: any, args: Args) {
    const { error, value } = assignmentSchema.validate(args);

    if (error) {
        throw new GraphQLError('Validation error', {
            extensions: {
                code: 'VALIDATION_ERROR',
                errors: error.details.map((err: any) => ({
                    path: err.path[0],  // e.g., 'title'
                    message: err.message // e.g., '"title" is required'
                })),
            },
        });
    }

    return await prisma.assignment.create({ data: value });
}
