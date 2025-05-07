import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient();

export const calendarEventTypeDefs = gql`

    type CalendarEvent {
        id: Int!
        title: String
        body: String
        read: Boolean

        userId: Int!

        createdAt: String
        updatedAt: String

        user: User!
    }

    type Query {
        calendarEvents(userId: Int!): [CalendarEvent!]!
        calendarEvent(id: Int!): CalendarEvent
    }

    type Mutation {
        createCalendarEvent(title: String, body: String, userId: Int!, eventDate: String!): CalendarEvent
        deleteCalendarEvent(id: Int!): CalendarEvent
    }
`;

export const calendarEventResolvers = {
    CalendarEvent: {
        user: (parent: any) => prisma.user.findUnique({ where: { id: parent.userId } })
    },
    Query: {
        calendarEvents: (_: any, args: { userId: number; }) => prisma.calendarEvent.findMany({ where: { userId: args.userId } }),
        calendarEvent: (_: any, args: { id: number; }) => prisma.calendarEvent.findUnique({ where: { id: args.id } })
    },
    Mutation: {
        createCalendarEvent,
        deleteCalendarEvent
    }
};

type Args = {
    title?: string;
    body?: string;
    userId: number;
    eventDate: string;
};

async function createCalendarEvent(_: any, args: Args) {
    const result = await prisma.calendarEvent.create({ data: args });
    return result;
}

async function deleteCalendarEvent(_: any, args: { id: number; }) {
    const result = await prisma.calendarEvent.delete({ where: { id: args.id } });
    return result;
}