import { PrismaClient } from "@prisma/client";
import gql from "graphql-tag";
import { FileUpload } from "../../../lib/graphql-upload";
import path from "path";
import fs from "fs";


const prisma = new PrismaClient();


export const subjectTypDefs = gql`
    type Subject {  
        id: Int!
        title: String!

        coverImgUrl: String
        classLevelId: Int!

        createdAt: String!
        updatedAt: String!

        teacherAssignedSubjects: [TeacherAssignedSubject!]!
        subjectMaterials: [SubjectMaterial!]!

        gradeLevel: ClassLevel
    }

    type Query {
        subjects(offset: Int, limit: Int): [Subject!]!
        subject(id: Int!): Subject!
        subjectPerLevel(classLevelId: Int!): [Subject]
    }

    scalar Upload

    type Mutation {
        createNewSubject(title: String!, coverImg: Upload): Subject!
        addSubjectCoverImg(coverImg: Upload): Subject!
    }
`;

export const subjectResolvers = {
    Subject: {
        teacherAssignedSubjects: async (parent: any) => {
            return await prisma.teacherAssignedSubject.findMany({ where: { subjectId: parent.id } });
        },
        subjectMaterials: async (parent: any) => {
            return await prisma.subjectMaterial.findMany({ where: { subjectId: parent.id } });
        },
        gradeLevel: async (parent: any) => prisma.classLevel.findUnique({ where: { id: parent.classLevelId } })
    },
    Query: {
        subjects: async (_: any, args: { offset: number, limit: number; }) => {
            const { offset = 0, limit = 10 } = args;

            const subjects = await prisma.subject.findMany({
                skip: offset,
                take: limit,
                orderBy: { createdAt: "desc" }
            });

            return subjects;
        },

        subject: (_: any, args: { id: number; }) =>
            prisma.subject.findUnique({
                where: {
                    id: args.id
                },
                include: {
                    TeacherAssignedSubject: true,
                    SubjectMaterial: true
                }
            }),
        subjectPerLevel: (_: any, args: { classLevelId: number; }) => prisma.subject.findMany({
            where: { classLevelId: args.classLevelId }
        })
    },
    Mutation: {
        createNewSubject,
        addSubjectCoverImg
    }
};

type Args = {
    title: string;
    coverImg?: Promise<FileUpload>;
    classLevelId: number;
};

async function createNewSubject(_: any, args: Args) {
    let fileUrl: string | null = null;

    if (args.coverImg) {
        const { createReadStream, filename, mimetype } = await args.coverImg;

        if (!mimetype.startsWith('image/')) {
            throw new Error('Only image uploads are allowed');
        }

        const uploadsDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        const uniqueName = `${Date.now()}-${filename}`;
        const filepath = path.join(uploadsDir, uniqueName);
        const fileStream = createReadStream();

        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(filepath);
            fileStream.pipe(writeStream);
            writeStream.on('finish', () => resolve);
            writeStream.on('error', reject);
        });

        fileUrl = `http://localhost:4000/uploads/${uniqueName}`;
    }



    return await prisma.subject.create({
        data: {
            title: args.title,
            coverImgUrl: fileUrl,
            classLevelId: args.classLevelId
        }
    });
}

async function addSubjectCoverImg(_any: any, args: { subjectId: number, coverImg: Promise<FileUpload>; }) {
    const { createReadStream, filename, mimetype } = await args.coverImg;

    if (!mimetype.startsWith('image/')) {
        throw new Error('Only image uploads are allowed');
    }

    const uploadsDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const uniqueName = `${Date.now()}-${filename}`;
    const filepath = path.join(uploadsDir, uniqueName);
    const fileStream = createReadStream();

    await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filepath);
        fileStream.pipe(writeStream);
        writeStream.on('finish', () => resolve);
        writeStream.on('error', reject);
    });

    const fileUrl = `http://localhost:4000/uploads/${uniqueName}`;

    const updatedSubject = await prisma.subject.update({
        where: { id: args.subjectId },
        data: { coverImgUrl: fileUrl },
    });

    return updatedSubject;
}