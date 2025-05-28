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

const upload = multer({ storage, limits: { fileSize: Infinity, fieldSize: Infinity } });


const router = Router();

router.use(upload.array("files"));

router.post("/submit-assignment", asyncHandler(Controller.submitAssignment));
router.post("/upload-subject-material", asyncHandler(Controller.uploadSubjectMaterial));
router.post("/add-subject", asyncHandler(Controller.addSubject));

router.post("/create-quiz", asyncHandler(Controller.createQuiz));

router.post("/finish-quiz", asyncHandler(Controller.finishQuiz));

router.post("/request-user-update", asyncHandler(Controller.requestUserUpdate));
router.post("/confirm-user-update", asyncHandler(Controller.confirmUserUpdate));
router.post("/update-lesson", asyncHandler(Controller.updateSubjectMaterial));

router.post("/score-assignment", asyncHandler(Controller.scoreClasswork));

router.post("/add-teacher-to-subject", asyncHandler(Controller.addTeacherToSubject));

router.post("/enroll-student", asyncHandler(Controller.enrollStudent));
router.post("/update-user", asyncHandler(Controller.updateUser));

router.get("/delete-meeting", asyncHandler(Controller.deleteMeeting));

router.post("/create-user", asyncHandler(Controller.createUser));

router.delete("/delete-material/:id", asyncHandler(Controller.deleteMaterial));

router.post("/edit-quiz", asyncHandler(Controller.editQuiz2));

router.post("/add-section", asyncHandler(Controller.addSection));

router.post("/add-school-year", asyncHandler(Controller.addSchoolYear));

export default router;