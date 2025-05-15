import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient();

export const questionTypeDef = gql`
    enum QuestionType {
        MULTIPLE_CHOICE
        TRUE_FALSE
        SHORT_ANSWER
    }

    type Question {
        id: Int!
        questionText: String!
        type: QuestionType
        subjectMaterialId: Int!
        subjectMaterial: SubjectMaterial
        answers: [Answer!]
        createdAt: String
        updatedAt: String
        AnswerKey: AnswerKey
    }

    type Answer {
        id: Int!
        answerText: String!
        questionId: Int!
        isCorrect: Boolean
        question: Question
    }


    type AnswerKey {
        id: Int!
        explanation: String
        questionId: Int!
        question: Question
    }

    type Query {
        questions: [Question!]!
        question(id: Int): Question

        answers(questionId: Int): [Answer!]!

        answerKeys(questionId: Int): AnswerKey
    }

    type Mutation {
        createQuestion(text: String! 
            type: QuestionType 
            subjectId: Int! 
        ): Question
        createChoice(text: String!, questionId: Int!, isCorrect: Boolean): Answer!
    }
`;


export const questionResolvers = {
    Question: {
        answers: (parent: any) => prisma.answer.findMany({ where: { questionId: parent.id } })
    },
    Query: {
        questions: () => prisma.question.findMany(),
        question: (_: any, args: { id: number; }) => prisma.question.findUnique({ where: { id: args.id } }),
        answers: (_: any, args: { questionId: number; }) => prisma.answer.findMany({ where: { questionId: args.questionId } }),
        // answerKeys: (_: any, args: { questionId: number; }) => prisma.answerKey.findMany({ where: { questionId: args.questionId } })
    },
    Mutation: {
        createQuestion,
        createChoice
    }
};

type QuestionArgs = {
    questionText: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    subjectMaterialId: number;
    answers?: AnswerArgs[];
};


async function createQuestion(_: any, args: QuestionArgs) {
    const {
        type,
        answers,
        subjectMaterialId,
        questionText
    } = args;

    return await prisma.question.create({
        data: {
            type,
            subjectMaterialId,
            questionText,
            answers: !!answers ? {
                create: answers
            } : {}
        },
        include: {
            answers: true
        }
    });
}

type AnswerArgs = {
    answerText: string;
    questionId: number;
    isCorrect: boolean;
};

async function createChoice(_: any, args: AnswerArgs) {
    return await prisma.answer.create({ data: args });
}