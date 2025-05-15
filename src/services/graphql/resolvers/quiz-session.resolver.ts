import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import { number } from "joi";


const prisma = new PrismaClient();

export const quizSessionTypeDef = gql`
    type QuizSession {
        id: Int!
        studentId: Int!
        quizId: Int!

        score: Float

        createdAt: String
        
        student: User
        quiz: SubjectMaterial
    }

    type QuizSessionAnswer {
        id: Int!
        sessionId: Int!
        answerText: String
        answerId: Int

        session: QuizSession
        answer: Answer
    }

    input SessionAnswer {
        sessionId: Int!
        answerText: String
        choiceId: Int
    }


    type Query {
        quizSessions: [QuizSession!]
        quizSession(id: Int!): QuizSession

        quizSessionAnswers(sessionId: Int!): [QuizSessionAnswer!]
        quizSessionAnswer(id: Int!): QuizSessionAnswer
    }

    type Mutation {
        createSession(studentId: Int!, quizId: Int!, answers: [SessionAnswer]): QuizSession!
    }
`;


export const quizSessionResolvers = {
    Query: {
        quizSessions: () => prisma.quizSession.findMany(),
        quizSession: (_: any, args: { id: number; }) => prisma.quizSession.findUnique({ where: { id: args.id } }),
        quizSessionAnswers: (_: any, args: { sessionId: number; }) => prisma.quizSessionAnswer.findMany({ where: { sessionId: args.sessionId } }),
        quizSessionAnswer: (_: any, args: { id: number; }) => prisma.quizSessionAnswer.findUnique({ where: { id: args.id } })
    },
    Mutation: {
        createSession: () => {
        }
    }
};