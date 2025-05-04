import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query";

const prisma = new PrismaClient();


export const subjectTypDefs = gql`
    type Subject {
        id: Int!
        title: String!

        createdAt: String!
        updatedAt: String!

        teacherAssignedSubjects: [TeacherAssignedSubject!]!
        subjectMaterials: [SubjectMaterial!]!
    }

    type Query {
        subjects: [Subject!]!
        subject(id: Int!): Subject!
    }

    type Mutation {
        createNewSubject(title: String!): Subject
    }
`;

export const subjectResolvers = {
    Subject: {
        teacherAssignedSubjects: async (parent: any) => {
            return await prisma.teacherAssignedSubject.findMany({ where: { subjectId: parent.id } });
        },
        subjectMaterials: async (parent: any) => {
            console.log("subject material: ", parent);
            return await prisma.subjectMaterial.findMany({ where: { subjectId: parent.id } });
        }
    },
    Query: {
        subjects: () =>
            prisma.subject.findMany({
                include: {
                    SubjectMaterial: true,
                    TeacherAssignedSubject: true
                }
            }),
        subject: (_: any, args: { id: number; }) =>
            prisma.subject.findUnique({
                where: {
                    id: args.id
                },
                include: {
                    TeacherAssignedSubject: true,
                    SubjectMaterial: true
                }
            })
    },
    Mutation: {
        createNewSubject
    }
};

type Args = {
    title: string;
};

async function createNewSubject(_: any, args: Args) {
    return await prisma.subject.create({ data: args });
}