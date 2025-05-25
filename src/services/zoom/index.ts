import { Router } from "express";
import asyncHandler from "../../middlewares/asynchandler";
import * as Controller from "./controller";

const router = Router();

router.get("/authorize", asyncHandler(Controller.authorize));

router.post("/oauth/callback", asyncHandler(Controller.getOAuthToken));

router.get("/create-meeting", asyncHandler(Controller.createMeeting));
router.post("/join-meeting/:id", asyncHandler(Controller.createMeeting));


router.post("/sdk-endpoint", asyncHandler(Controller.SDKEndPoint));
router.get("/get-live-session", asyncHandler(Controller.getLiveSession));

export default router;