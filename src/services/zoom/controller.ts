import type { Request, Response } from "express";
import { ZOOM_CLIENT_SECRET, ZOOM_CLIENT_ID, ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET, PORT } from "../config/constants";
import axios from "axios";
import { KJUR } from 'jsrsasign';

import { inNumberArray, isBetween, isRequiredAllOrNone, validateRequest } from "./validator";
import { PrismaClient } from "@prisma/client";
import { ErrorResponse } from "../util/response";

const callbackURI = `http://localhost:${PORT}/zoom/oauth/callback`;

export async function authorize(req: Request, res: Response) {
    const { redirect_uri } = req.query;

    if (!redirect_uri)
        throw new ErrorResponse(400, "", { message: "Invalid redirect URI" });

    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${redirect_uri}`;

    return res.status(200).json({
        redirect_url: zoomAuthUrl
    });
}

export async function getOAuthToken(req: Request, res: Response) {
    const authCode = req.query.code + "";
    const tokenUrl = "https://zoom.us/oauth/token";
    const prisma = new PrismaClient();

    const basicAuth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

    const matchedSession = await prisma.meetingSession.findUnique({ where: { authCode: authCode } });

    if (!!matchedSession) {
        return res.status(200).json(matchedSession);
    }

    try {
        const paramObj = {
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: "http://localhost:4200/teacher/meeting"
        };

        const params = new URLSearchParams((<any>paramObj));

        const tokenResponse = await axios.post(`${tokenUrl}?${params.toString()}`, {},
            {
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });


        const body = {
            "type": 2,
            "start_time": "2025-05-05T10:00:00Z",
            "duration": 30,
            "timezone": "Asia/Manila",
            "agenda": "Discuss project",
            "settings": {
                "join_before_host": true,
                "approval_type": 0
            },

            "teacher_id": 1,
            "teacher_assigned_subject_id": 1
        };



        const uri = "https://api.zoom.us/v2/users/me/meetings";

        const response = await axios.post(uri, body,
            {
                headers: {
                    Authorization: `Bearer ${tokenResponse.data.access_token}`
                }
            }
        );

        const result = await prisma.meetingSession.create({
            data: {
                meetingID: response.data.id + "",
                hostEmail: response.data.host_email,
                hostID: response.data.host_id,
                joinURL: response.data.join_url,
                password: response.data.password,
                startURL: response.data.start_url,
                topic: response.data.topic,
                uuid: response.data.uuid,
                authCode: authCode,
                createdBy: body.teacher_id,
                teacherAssignedSubjectId: body.teacher_assigned_subject_id,
            },
            include: {
                teacher: true,
                teacherSubject: true
            }
        });

        return res.json({ data: result });

        return res.send("Bullshit");
    } catch (error: any) {
        console.error("Error getting token:", error.response?.data || error.message);
        res.status(500).send("Token exchange failed");
    }
}

type MeetingBody = {
    type: number;
    start_time: string;
    duration: number;
    timezone: string;
    agenda: string;
    settings: {
        join_before_host: boolean;
        approval_type: number;
    };
    teacher_id: number,
    teacher_assigned_subject_id: number,
};


// https://api.zoom.us/v2/users/me/meetings
export async function createMeeting(req: Request, res: Response) {
    const body = {
        "type": 2,
        "start_time": "2025-05-05T10:00:00Z",
        "duration": 30,
        "timezone": "Asia/Manila",
        "agenda": "Discuss project",
        "settings": {
            "join_before_host": true,
            "approval_type": 0
        },

        "teacher_id": 1,
        "teacher_assigned_subject_id": 1
    };

    const token = req.query.token + "";

    const uri = "https://api.zoom.us/v2/users/me/meetings";

    const response = await axios.post(uri, body,
        {
            headers: {
                Authorization: token
            }
        }
    );

    const prisma = new PrismaClient();

    const result = await prisma.meetingSession.create({
        data: {
            meetingID: response.data.id + "",
            hostEmail: response.data.host_email,
            hostID: response.data.host_id,
            joinURL: response.data.join_url,
            password: response.data.password,
            startURL: response.data.start_url,
            topic: response.data.topic,
            uuid: response.data.uuid,
            createdBy: body.teacher_id,
            teacherAssignedSubjectId: body.teacher_assigned_subject_id,
        },
        include: {
            teacher: true,
            teacherSubject: true
        }
    });


    return res.json({ data: result });
}

export async function joinMeeting(req: Request, res: Response) {

}


const coerceRequestBody = (body: any) => ({
    ...body,
    ...['role', 'expirationSeconds'].reduce(
        (acc, cur) => ({ ...acc, [cur]: typeof body[cur] === 'string' ? parseInt(body[cur]) : body[cur] }),
        {}
    )
});

const propValidations = {
    role: inNumberArray([0, 1]),
    expirationSeconds: isBetween(1800, 172800)
};

const schemaValidations = [isRequiredAllOrNone(['meetingNumber', 'role'])];

export async function SDKEndPoint(req: Request, res: Response) {
    const requestBody = coerceRequestBody(req.body);
    const validationErrors = validateRequest(requestBody, propValidations, schemaValidations);

    if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    const { meetingNumber, role, expirationSeconds } = requestBody;
    const iat = Math.floor(Date.now() / 1000);
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };

    const oPayload = {
        appKey: ZOOM_MEETING_SDK_KEY,
        sdkKey: ZOOM_MEETING_SDK_KEY,
        mn: meetingNumber,
        role,
        iat,
        exp,
        tokenExp: exp
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const sdkJWT = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, ZOOM_MEETING_SDK_SECRET);

    return res.json({ signature: sdkJWT, sdkKey: process.env.ZOOM_MEETING_SDK_KEY });
}

export async function getLiveSession(req: Request, res: Response) {
    const teacherSubjectId = req.query.teacher_subject_id;

    const prisma = new PrismaClient();

    const result = await prisma.meetingSession.findMany({
        where: {
            teacherAssignedSubjectId: parseInt(teacherSubjectId + "")
        },
    });

    return res.status(200).json(result[result.length - 1]);
}