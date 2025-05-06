import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";


const prisma = new PrismaClient();

const quizSessionTypeDef = gql`
    type QuizSession {
        id: Int!
        studentId: Int!
        quizId: Int!

        createdAt: String
        
        student: User
        quiz: SubjectMaterial
    }

    type QuizSessionAnswer {
        id: Int!
        sessionId: Int!
        answerText: String
        choiceId: Int

        session: QuizSession
        choice: Choice
    }

    input SessionAnswer {
        sessionId: Int!
        answerText: String
        choiceId: Int
    }


    type Query {
        quizSessions: [QuizSession!]
        quizSession: QuizSession

        quizSessionAnswers: [QuizSessionAnswer!]
        quizSessionAnswer: QuizSessionAnswer
    }

    type Mutation {
        createSession(studentId: Int!, quizId: Int!, answers: [SessionAnswer]): QuizSession!
    }
`;


export const quizSessionResolvers = {
    Query: {
        quizSessions: () => prisma.quizSession.findMany(),
    },
    Mutation: {
        createSession: () => {
            
        }
    }
}