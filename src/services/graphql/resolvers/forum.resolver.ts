import { Prisma, PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

export const forumTypeDef = gql`
    type ForumDiscussion {
        id: Int!
        title: String
        query: String

        createdById: Int!
        createdAt: String
        updatedAt: String

        forumComments: [ForumComment]
        createdBy: User
    }

    type ForumComment {
        id: Int!
        commentText: String!
        createdAt: String
        updatedAt: String
        createdById: Int!
        createdBy: User
        forumDiscussion: ForumDiscussion!
        parentComment: ForumComment

        replies: [ForumComment]
    }

    type Query {
        forumDiscussions(teacherSubjectId: Int!): [ForumDiscussion!]!
        forumDiscussion(id: Int!): ForumDiscussion
    }

    type Mutation {
        createForumDiscussion(
        title: String
        query: String
        teacherSubjectId: Int!
        createdById: Int!
        ): ForumDiscussion!

     addComment(
        forumDiscussionId: Int!
        commentText: String!
        createdById: Int!
        parentCommentId: Int
    ): ForumComment!
    }
`;

export const forumResolvers = {
    ForumDiscussion: {
        forumComments: (parent: any) => prisma.forumComment.findMany({ where: { forumDiscussionId: parent.id, parentCommentId: null }, }),
        createdBy: (parent: any) => prisma.user.findUnique({ where: { id: parent.createdById } })
    },
    ForumComment: {
        replies: (parent: any) => prisma.forumComment.findMany({ where: { parentCommentId: parent.id } }),
        createdBy: async (parent: any) => {
            const createdBy = await prisma.user.findUnique({ where: { id: parent.createdById } });
            return createdBy;
        }
    },
    Query: {
        forumDiscussions: (_: any, args: { teacherSubjectId: number; }) => prisma.forumDiscussion.findMany({ where: { teacherSubjectId: args.teacherSubjectId } }),
        forumDiscussion: (_: any, args: { id: number; }) => prisma.forumDiscussion.findUnique({ where: { id: args.id } })
    },

    Mutation: {
        createForumDiscussion,
        addComment
    }
};


async function createForumDiscussion(_: any, args: {
    title?: string;
    query?: string;
    teacherSubjectId: number;
    createdById: number;
}) {

    const discussion = await prisma.forumDiscussion.create({ data: args });

    return discussion;
}

async function addComment(_: any, args: {
    forumDiscussionId: number;
    commentText: string;
    createdById: number;
    parentCommentId?: number;
}) {
    const comment = await prisma.forumComment.create({
        data: {
            commentText: args.commentText,
            parentCommentId: args.parentCommentId,
            createdById: args.createdById,
            forumDiscussionId: args.forumDiscussionId
        }
    });

    return comment;
}