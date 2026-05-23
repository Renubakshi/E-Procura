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

// get fund request status
export const getMyFundRequests = async (req, res) => {
  try {
    const requests = await FundBooking.find({
      requestedBy: req.user.email,
    }).sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};