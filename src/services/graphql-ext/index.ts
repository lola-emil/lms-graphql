import { Router } from "express";
import multer from "multer";
import os from "os";
import asyncHandler from "../../middlewares/asynchandler";
import * as Controller from "./controller";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../public/uploads"));
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });


const router = Router();

router.use(upload.array("files"));

router.post("/submit-assignment", asyncHandler(Controller.submitAssignment));

export default router;