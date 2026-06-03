import express from "express";
import {
  createFundBooking,
  getMyFundRequests,
  getAllFundBookings,
  approveFundBooking,
  rejectFundBooking,
} from "../controllers/fundBookingController.js";
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// PI → create a fund booking request
router.post("/", auth(["PI"]), createFundBooking);

// PI → get my own requests
router.get("/", auth(["PI"]), getMyFundRequests);

// DORD → get all fund booking requests
router.get("/all", auth(["DORD"]), getAllFundBookings);

// DORD → approve (optional signed PDF upload)
router.put("/:id/approve", auth(["DORD"]), upload.single("signedPdf"), approveFundBooking);

// DORD → reject (with remark in body)
router.put("/:id/reject", auth(["DORD"]), rejectFundBooking);

export default router;
