import express from "express"
const router = express.Router();
import {upload} from "../middleware/upload.js"
import { auth } from "../middleware/auth.js";
import {generateApprovalLetter,
  createRecruitmentAdvertisement,getMyRequests} from "../controllers/recruitmentController.js"

router.post("/generate-approval-letter", generateApprovalLetter);

router.post("/create-advertisement",upload.single("attachment"), createRecruitmentAdvertisement);
router.get("/",auth(["PI"]), getMyRequests)

export default router;
