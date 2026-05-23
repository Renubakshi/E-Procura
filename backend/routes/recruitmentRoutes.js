import express from "express";
const router = express.Router();
import { upload } from "../middleware/upload.js";
import {
  generateApprovalLetter,
  createRecruitmentAdvertisement,
  getAllRecruitments,
  approveRecruitment,
  rejectRecruitment,
} from "../controllers/recruitmentController.js";

router.post("/generate-approval-letter", generateApprovalLetter);

router.post(
  "/create-advertisement",
  upload.single("attachment"),
  createRecruitmentAdvertisement,
);

// ======================================
// DEAN DASHBOARD ROUTES
// ======================================

// Fetch all recruitments

router.get("/", getAllRecruitments);

// Approve recruitment

router.put("/:id/approve", approveRecruitment);

// Reject recruitment

router.put("/:id/reject", rejectRecruitment);

export default router;
