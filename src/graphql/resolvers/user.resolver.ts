import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export const userResolvers = {
    Query: {
        users: () => prisma.user.findMany({ include: { profile: true } }),
        user: (_: any, args: { id: number; }) => prisma.user.findUnique({
            where: { id: args.id },
            include: { profile: true }
        })
    },

};