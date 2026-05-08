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

    totalAmount: {
      type: Number,
      required: true,
    },
    process:String,

    status: {
      type: String,
      default: "PENDING",
    },

    requestedBy: {
      type: String, // PI employeeId
    },
  },
  { timestamps: true },
);

export default mongoose.model("FundBooking", fundBookingSchema);
