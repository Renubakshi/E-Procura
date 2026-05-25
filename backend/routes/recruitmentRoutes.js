import express from "express";

const router = express.Router();

import { upload } from "../middleware/upload.js";

import { auth } from "../middleware/auth.js";

import {
  generateApprovalLetter,
  createRecruitmentAdvertisement,
  getAllRecruitments,
  approveRecruitment,
  rejectRecruitment,
  getMyRequests,
} from "../controllers/recruitmentController.js";

// ======================================
// PI ROUTES
// ======================================

router.post("/generate-approval-letter", generateApprovalLetter);

router.post(
  "/create-advertisement",
  auth(["PI"]),
  upload.single("attachment"),
  createRecruitmentAdvertisement,
);
// PI can view own requests

router.get("/my-requests", auth(["PI"]), getMyRequests);

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
