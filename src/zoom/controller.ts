import type { Request, Response } from "express";
import { ZOOM_CLIENT_SECRET, ZOOM_CLIENT_ID, ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET, PORT } from "../config/constants";
import axios from "axios";
import { KJUR } from 'jsrsasign'

import { inNumberArray, isBetween, isRequiredAllOrNone, validateRequest } from "./validator";

const callbackURI = `http://localhost:${PORT}/zoom/oauth/callback`;

export async function authorize(req: Request, res: Response) {
    // const { redirect_uri } = req.query;

    // if (!redirect_uri)
    //     throw new ErrorResponse(400, "", { message: "Invalid redirect URI" });

    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${callbackURI}`;

    return res.status(200).json({
        redirect_url: zoomAuthUrl
    });
}

export async function getOAuthToken(req: Request, res: Response) {
    const authCode = req.query.code;
    const tokenUrl = "https://zoom.us/oauth/token";

    const basicAuth = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");

    try {
        const paramObj = {
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: callbackURI
        };

        const params = new URLSearchParams((<any>paramObj));

        const response = await axios.post(`${tokenUrl}?${params.toString()}`, {},
            {
                headers: {
                    Authorization: `Basic ${basicAuth}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

        console.log("Access Token:", response.data.access_token);

        return res.status(200).json({
            access_token: response.data.access_token
        });
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
};

// https://api.zoom.us/v2/users/me/meetings
export async function createMeeting(req: Request, res: Response) {
    const body = req.body as MeetingBody;
    const token = req.headers["authorization"];

    return res.json({ body, token });
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

const schemaValidations = [isRequiredAllOrNone(['meetingNumber', 'role'])]

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