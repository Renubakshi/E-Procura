import FundBooking from "../models/FundBooking.js";
import CodeCreation from "../models/codeCreation.js";

export const createFundBooking = async (req, res) => {
  try {
    const { projectId, head, positions,process,requestedAmount } = req.body;

    // fetch project
    const project = await CodeCreation.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // check head exists
    const divisionHeads = project.piSubmissions?.divisionHeads;

    if (!divisionHeads || !divisionHeads[head]) {
      return res.status(400).json({ message: "Invalid head selected" });
    }

let totalAmount = 0;
    // ✅ MANPOWER LOGIC
    if (process === "manpower") {
      if (!positions || positions.length === 0) {
        return res.status(400).json({ message: "No positions provided" });
      }

      for (const p of positions) {
        if (!p.role || !p.post || !p.salary || !p.months) {
          return res.status(400).json({
            message: "Invalid position data",
          });
        }
      }

      totalAmount = positions.reduce((sum, p) => {
        return sum + p.post * p.salary * p.months;
      }, 0);
    }

    // ✅ OTHER PROCESS LOGIC
    else {
      if (!requestedAmount || requestedAmount <= 0) {
        return res.status(400).json({
          message: "Invalid requested amount",
        });
      }

      totalAmount = Number(requestedAmount);
    }

    // ✅ COMMON VALIDATION
    if (totalAmount > divisionHeads[head]) {
      return res.status(400).json({
        message: "Amount exceeds available head budget",
      });
    }
    // save request (NO deduction yet)
    const newRequest = await FundBooking.create({
      projectId,
      projectCode: project.projectCode,
      head,
      positions,
      requestedAmount : totalAmount,
      process,
      requestedBy: req.user.email, // from JWT
    });

    res.status(201).json({
      message: "Fund booking request sent",
      data: newRequest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PI — get my fund requests
export const getMyFundRequests = async (req, res) => {
  try {
    const requests = await FundBooking.find({
      requestedBy: req.user.email,
    }).populate("projectId", "piSubmissions").sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DORD — get all fund booking requests
export const getAllFundBookings = async (req, res) => {
  try {
    const requests = await FundBooking.find().populate("projectId", "piSubmissions").sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DORD — approve a fund booking (with optional signed PDF upload)
export const approveFundBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await FundBooking.findById(id);
    if (!booking) return res.status(404).json({ message: "Request not found" });

    if (booking.status !== "Pending")
      return res.status(400).json({ message: "Request already processed" });

    const signedApprovalPdf = req.file ? `/uploads/${req.file.filename}` : "";

    booking.status = "Approved";
    booking.signedApprovalPdf = signedApprovalPdf;
    booking.remarkByDean = "";
    await booking.save();

    res.status(200).json({ message: "Fund booking approved", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DORD — reject a fund booking (with remark)
export const rejectFundBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarkByDean } = req.body;

    if (!remarkByDean || !remarkByDean.trim())
      return res.status(400).json({ message: "Rejection remark is required" });

    const booking = await FundBooking.findById(id);
    if (!booking) return res.status(404).json({ message: "Request not found" });

    if (booking.status !== "Pending")
      return res.status(400).json({ message: "Request already processed" });

    booking.status = "Rejected";
    booking.remarkByDean = remarkByDean.trim();
    await booking.save();

    res.status(200).json({ message: "Fund booking rejected", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};