import { Router } from "express";
import multer from "multer";
import os from "os";
import asyncHandler from "../../middlewares/asynchandler";
import * as Controller from "./controllers";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir());
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const router = Router();

router.use(upload.single("file"));

router.post("/bulk-import-user", asyncHandler(Controller.bulkImportUsers));

export default router;