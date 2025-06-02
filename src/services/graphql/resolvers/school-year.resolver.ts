import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const schoolYearTypeDefs = gql`
    type SchoolYear {
        id: Int!
        yearStart: Int!
        yearEnd: Int!

        isCurrent: Boolean

        createdAt: String!
        updatedAt: String!
    }

    type Query {
        schoolYears: [SchoolYear!]!
        schoolYear(id: Int): User
        currentSchoolYear: SchoolYear
    }

`;

export const schoolYearResolvers = {
    Query: {
        schoolYears: () => prisma.schoolYear.findMany(),
        schoolYear: (_: any, args: { id: number; }) => prisma.schoolYear.findUnique({ where: { id: args.id } }),
        currentSchoolYear: async (_: any) => {
            const result = await prisma.schoolYear.findMany({ where: { isCurrent: true } });
            return result[0];
        }
    },


};
