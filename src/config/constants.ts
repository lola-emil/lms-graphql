import { config } from "dotenv";

config();

export const DB_HOST = process.env["DB_HOST"] ?? "localhost";
export const DB_PORT = parseInt(process.env["DB_PORT"] ?? "3306");
export const DB_NAME = process.env["DB_NAME"] ?? "webrtc";
export const DB_USER = process.env["DB_USER"] ?? "root";
export const DB_PASSWORD = process.env["DB_PASSWORD"] ?? "";


export const HOSTNAME = process.env["HOSTNAME"] ?? "localhost";
export const PORT = parseInt(process.env["PORT"] ?? "5000");

export const JWT_SECRET_KEY = process.env["JWT_SECRET_KEY"] ?? "secret-madafak";

export const MAILER_HOST = process.env["MAILER_HOST"];
export const MAILER_ADDRESS = process.env["MAILER_ADDRESS"] ?? "staleexam19@gmail.com";
export const MAILER_PASSWORD = process.env["MAILER_PASSWORD"];


export const ZOOM_MEETING_SDK_KEY = process.env["ZOOM_MEETING_SDK_KEY"];
export const ZOOM_MEETING_SDK_SECRET = process.env["ZOOM_MEETING_SDK_SECRET"];
export const ZOOM_CLIENT_ID = process.env["ZOOM_CLIENT_ID"];
export const ZOOM_CLIENT_SECRET = process.env["ZOOM_CLIENT_SECRET"];