import { Router } from "express";
import asyncHandler from "../middlewares/asynchandler";
import * as Controller from "./controller";

const router = Router();

router.get("/authorize", asyncHandler(Controller.authorize));

router.get("/oauth/callback", asyncHandler(Controller.getOAuthToken));

router.post("/create-meeting", asyncHandler(Controller.createMeeting));
router.post("/join-meeting", asyncHandler(Controller.createMeeting));


router.post("/sdk-endpoint", asyncHandler(Controller.SDKEndPoint))

export default router;