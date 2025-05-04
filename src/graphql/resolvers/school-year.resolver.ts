import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const schoolYearTypeDefs = gql`
    type SchoolYear {
        id: Int!
        yearStart: Int!
        yearEnd: Int!

        createdAt: String!
        updatedAt: String!
    }

    type Query {
        schoolYears: [SchoolYear!]!
        schoolYear(id: Int): User
    }

    type Mutation {
        createSchoolYear(yearStart: Int!, yearEnd: Int!): SchoolYear!
    }
`;

export const schoolYearResolvers = {
    Query: {
        schoolYears: () => prisma.schoolYear.findMany(),
        schoolYear: (_: any, args: { id: number; }) => prisma.schoolYear.findUnique({ where: { id: args.id } })
    },

    Mutation: {
        createSchoolYear
    }
};

type Args = {
    yearStart: number,
    yearEnd: number;
};

async function createSchoolYear(_: any, args: Args) {
    return await prisma.schoolYear.create({ data: args });
}
