import express from "express";
const router = express.Router();
import { upload } from "../middleware/upload.js";
import { auth } from "../middleware/auth.js";
import Recruitment from "../models/recruitmentModel.js";

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

router.post("/generate-approval-letter",auth(["PI"]), generateApprovalLetter);

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

router.put("/:id/approve",auth(["DORD"]), upload.single("signedPdf"), approveRecruitment);

// Reject recruitment

router.put("/:id/reject",auth(["DORD"]), rejectRecruitment);

router.put("/:id/approval-letter", async (req, res) => {
  try {
    const { id } = req.params;

    const { approvalLetterPath } = req.body;

    const recruitment = await Recruitment.findByIdAndUpdate(
      id,
      {
        approvalLetterPath,
      },
      {
        new: true,
      },
    );

    res.status(200).json({
      success: true,
      recruitment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
