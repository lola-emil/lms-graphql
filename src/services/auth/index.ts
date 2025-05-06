import { Router } from "express";
import asyncHandler from "../../middlewares/asynchandler";
import * as Controller from "./controller";

const router = Router();

router.post("/sign-in", asyncHandler(Controller.signIn));

export default router;