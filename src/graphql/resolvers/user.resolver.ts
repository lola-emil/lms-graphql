import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import argon from "argon2";


const prisma = new PrismaClient();

export const userTypeDefs = gql`

    enum Role {
        ADMIN
        STUDENT
        TEACHER
    }
    type User {
        id: Int!
        email: String!

        firstname: String!
        middlename: String
        lastname: String

        role: Role!

        createdAt: String!
        updatedAt: String!
    }

    type Query {
        users: [User!]!
        user(id: Int): User 
    }

    type Mutation {
        createUser(firstname: String!, middlename: String, lastname: String, email: String!, password: String!, role: Role!): User!
        updateUser(firstname: String!, middlename: String, lastname: String, email: String!, password: String): User!
    }
`;



export const userResolvers = {
    Query: {
        users: () => prisma.user.findMany(),
        user: (_: any, args: { id: number; }) => prisma.user.findUnique({ where: { id: args.id } })
    },

    Mutation: {
        createUser,
        updateUser
    }
};

type Args = {
    firstname: string;
    middlename: string;
    lastname: string;
    email: string;
    password: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
};

async function createUser(_: any, args: Args) {
    args.password = await argon.hash(args.password);
    return await prisma.user.create({ data: args });
}


async function updateUser(_: any, args: { firstname: string, middlename: string, lastname: string; }) {

}