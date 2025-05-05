import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";

const prisma = new PrismaClient();

export const questionTypeDef = gql`
    enum QuestionType {
        MULTIPLE_CHOICE
        TRUE_FALSE
        ESSAY
    }

    type Question {
        id: Int!
        text: String!
        type: QuestionType
        subjectId: Int!
        subject: Subject
        choices: [Choice!]
        createdAt: String
        updatedAt: String
        AnswerKey: AnswerKey
    }

    input ChoiceInput {         
        text: String!
        isCorrect: Boolean!
    }

    type Choice {
        id: Int!
        text: String!
        questionId: Int!
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

        choices(questionId: Int): [Choice!]!

        answerKeys(questionId: Int): AnswerKey
    }

    type Mutation {
        createQuestion(text: String! 
            type: QuestionType 
            subjectId: Int! 
            choices: [ChoiceInput]
        ): Question
        createChoice(text: String!, questionId: Int!, isCorrect: Boolean): Choice!
    }
`;


export const questionResolvers = {
    Question: {
        choices: (parent: any) => prisma.choice.findMany({ where: { questionId: parent.id } })
    },
    Query: {
        questions: () => prisma.question.findMany(),
        question: (_: any, args: { id: number; }) => prisma.question.findUnique({ where: { id: args.id } }),
        choices: (_: any, args: { questionId: number; }) => prisma.choice.findMany({ where: { questionId: args.questionId } }),
        answerKeys: (_: any, args: { questionId: number; }) => prisma.answerKey.findMany({ where: { questionId: args.questionId } })
    },
    Mutation: {
        createQuestion,
        createChoice
    }
};

type QuestionArgs = {
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "ESSAY";
    subjectId: number;
    choices?: ChoiceArgs[];
};


async function createQuestion(_: any, args: QuestionArgs) {
    const {
        type,
        choices,
        subjectId,
        text
    } = args;

    return await prisma.question.create({
        data: {
            type,
            subjectId,
            text,
            choices: !!choices ? {
                create: choices
            } : {}
        },
        include: {
            choices: true
        }
    });
}

type ChoiceArgs = {
    text: string;
    questionId: number;
    isCorrect: boolean;
};

async function createChoice(_: any, args: ChoiceArgs) {
    return await prisma.choice.create({ data: args });
}