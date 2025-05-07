import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const classLevelTypeDefs = gql`
    type ClassLevel {
        id: Int!
        level: Int!

        createdAt: String
        updatedAt: String
    }

    type Query {
        classLevels: [ClassLevel!]!
        classLevel: ClassLevel
    }

    type Mutation {
        createClassLevel(level: Int!): ClassLevel!
    }
`;

export const classLevelResolvers = {
    Query: {
        classLevels: () => prisma.classLevel.findMany(),
        classLevel: (_: any, args: { id: number; }) => prisma.classLevel.findUnique({ where: { id: args.id } })
    },
    Mutation: {
        createClassLevel
    }
};

type Args = {
    level: number;
};

async function createClassLevel(_: any, args: Args) {
    const result = await prisma.classLevel.create({ data: args });
    return result;
}