import express from "express";
import { createFundBooking } from "./controllers/fundBookingController.js";
import {auth} from "../middleware/auth.js";

const router = express.Router();

// PI → create fund booking
router.post("/", auth(["PI"]), createFundBooking);

export default router;