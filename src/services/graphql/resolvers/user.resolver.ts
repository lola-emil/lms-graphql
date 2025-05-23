import { PrismaClient, Role } from "@prisma/client";
import gql from "graphql-tag";
import argon from "argon2";
import Joi from "joi";
import { ValidationError } from "../../../util/errors";
import { mailCredentials } from "../../../util/mailer";
import { BUSINESS_NAME } from "../../../config/constants";


const prisma = new PrismaClient();

type User = {
    id: number;
    email: string;
    firstname: string;
    middlename?: string;
    lastname: string;
    role: "ADMIN" | "TEACHER" | "STUDENT",

    password: string;
    createdAt: string;
    updatedAt: string;
};

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
        users(offset: Int = 0, limit: Int = 10, role: Role, searchQuery: String): [User!]!
        user(id: Int): User
        userByRole(role: Role): [User]
        teachers: [User]
        students: [User]
        userCount(role: Role): Int
        count(role: Role): Int
    }

    type Mutation {
        createUser(firstname: String!, middlename: String, lastname: String!, email: String!, password: String!, role: Role!): User!
        updateUser(firstname: String, middlename: String, lastname: String, email: String, password: String): User!
    }
`;



export const userResolvers = {
    User: {
    },
    Query: {
        users,
        user: (_: any, args: { id: number; }) => prisma.user.findUnique({ where: { id: args.id } }),
        teachers: (_: any) => prisma.user.findMany({ where: { role: "TEACHER" } }),
        students: (_: any) => prisma.user.findMany({ where: { role: "STUDENT" } }),
        userCount: (_: any, args: { role: Role; }) => prisma.user.count({ where: { role: args.role } }),
        userByRole: (_: any, args: { role: Role; }) => prisma.user.findMany({ where: { role: args.role } }),
        count: (_: any, args: { role: Role; }) => prisma.user.count({ where: { role: args.role ?? undefined } })
    },

    Mutation: {
        createUser,
        updateUser
    }
};

const userBodySchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    middlename: Joi.optional(),
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().min(8),
    role: Joi.string().valid("STUDENT", "ADMIN", "TEACHER").required()
});


async function users(_: any, args: { offset: number, limit: number; role?: Role; searchQuery?: string; }) {
    const {
        offset,
        limit
    } = args;

    return prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        where: {
            ...(args.searchQuery ? {
                OR: [
                    { firstname: { contains: args.searchQuery, } },
                    { middlename: { contains: args.searchQuery, } },
                    { lastname: { contains: args.searchQuery, } },
                    { email: { contains: args.searchQuery } },
                ],
            } : {}),
            role: args.role ?? undefined
        }
    });
}

async function createUser(_: any, args: User) {
    args.middlename = args.middlename;
    const { error, value } = userBodySchema.validate(args);

    if (error) {
        throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
    }

    const matchedUser = await prisma.user.findUnique({ where: { email: args.email } });

    if (matchedUser)
        throw new ValidationError(`Validation error: ${[
            {
                message: "Email already taken",
            }
        ].map(d => d.message).join(',')}`);

    let unhashed = args.password;
    args.password = await argon.hash(args.password);

    const result = await prisma.user.create({ data: args });

    await mailCredentials(result.email, {
        name: `${result.firstname} ${result.lastname}`,
        email: result.email,
        business: BUSINESS_NAME,
        password: unhashed
    });

    return result;
}

async function updateUser(_: any, args: { firstname: string, middlename: string, lastname: string; }) {

}