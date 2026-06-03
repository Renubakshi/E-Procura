import mongoose from "mongoose";

const fundBookingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeCreation",
      required: true,
    },

    projectCode: String,

    head: {
      type: String,
      required: true,
    },

    positions: [
      {
        role: String,
        post: Number,
        salary: Number,
        months: Number,
        amount: Number,
      },
    ],

    requestedAmount: {
      type: Number,
      required: true,
    },
    process:String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // dean remark on rejection
    remarkByDean: {
      type: String,
      default: "",
    },

    // signed PDF uploaded by dean on approval
    signedApprovalPdf: {
      type: String,
      default: "",
    },
    requestedBy: {
      type: String, // PI employeeId
    },
  },
  { timestamps: true },
);

export default mongoose.model("FundBooking", fundBookingSchema);
