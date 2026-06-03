import mongoose from "mongoose";

// ======================================
// POSITION SCHEMA
// ======================================

const positionSchema = new mongoose.Schema({
  positionName: {
    type: String,
    required: true,
  },

  numberOfPosts: {
    type: Number,
    required: true,
  },

  ageLimit: {
    type: String,
    required: true,
  },

  salaryStart: {
    type: String,
    required: true,
  },

  salaryEnd: {
    type: String,
    required: true,
  },

  duration: {
    type: String,
    required: true,
  },

  essentialQualifications: [
    {
      type: String,
    },
  ],

  desirableQualifications: [
    {
      type: String,
    },
  ],
});

// ======================================
// MAIN RECRUITMENT SCHEMA
// ======================================

const recruitmentSchema = new mongoose.Schema(
  {
    // ======================================
    // PROJECT DETAILS
    // ======================================

    projectTitle: {
      type: String,
      required: true,
    },

    projectCode: {
      type: String,
      required: true,
    },

    sponsoringAgency: {
      type: String,
    },

    // ======================================
    // PI DETAILS
    // ======================================

    piName: {
      type: String,
      required: true,
    },

    piDesignation: {
      type: String,
    },

    piDepartment: {
      type: String,
    },

    officeAddress: {
      type: String,
    },

    piEmail: {
      type: String,
    },

    piWebsite: {
      type: String,
    },

    // ======================================
    // POSITION DETAILS
    // ======================================

    positions: [positionSchema],

    // ======================================
    // FUND DETAILS
    // ======================================

    process: {
      type: String,
    },

    fundHead: {
      type: String,
    },

    fundHeadAmount: {
      type: Number,
    },

    requestedAmount: {
      type: Number,
    },

    requestedBy: {
      type: String,
    },

    // ======================================
    // APPLICATION DETAILS
    // ======================================

    submissionEmail: {
      type: String,
    },

    emailSubject: {
      type: String,
    },

    submissionDeadline: {
      type: String,
    },

    interviewDate: {
      type: String,
    },

    interviewMode: {
      type: String,

      enum: ["Online", "Offline", "Hybrid"],

      default: "Offline",
    },

    venue: {
      type: String,
    },

    reportingTime: {
      type: String,
    },

    // ======================================
    // COMMITTEE DETAILS
    // ======================================

    committeeMembers: [
      {
        type: String,
      },
    ],

    attachment: {
      type: String,
    },

    signaturePI: {
      type: String,
    },

    // ======================================
    // PDF DETAILS
    // ======================================

    pdfPath: {
      type: String,
    },

    approvalLetterPath: {
      type: String,
    },

    signedApprovalPdf: {
      type: String,
    },

    // ======================================
    // APPROVAL WORKFLOW
    // ======================================

    status: {
      type: String,

      enum: ["Pending", "Approved", "Rejected"],

      default: "Pending",
    },

    deanRemarks: {
      type: String,
    },

    approvedAt: {
      type: Date,
    },

    approvedBy: {
      type: String,
    },
    deanDecision: {
      action: {
        type: String,
        enum: ["APPROVED", "REJECTED"],
      },
      reason: String,
      signedBy: String,

      signatureDean: String,

      payload: Object,

      timestamp: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Recruitment = mongoose.model("Recruitment", recruitmentSchema);

export default Recruitment;
