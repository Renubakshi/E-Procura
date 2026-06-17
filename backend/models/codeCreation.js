import mongoose from "mongoose";

const codeCreationSchema = new mongoose.Schema({
  projectCode: {
    type: String,
    unique: true,
  },
  year: Number,
  department: String,
  sequenceNumber: Number,

  totalFundReceived:Number,
  bankTransactionId: String,

  piEmpId: String,
  piName: String,

  signature: String,
  signedBy: String,
  status: {
    type: String,
    default: "Sent to PI",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isBifurcated:{
    type:Boolean,
    default:false
  },
  piSubmissions: {
      title: { type: String },
      availableFunds: Number,
      divisionHeads: {
        "Manpower (including Interns)": { type: Number },
        Equipment: { type: Number },
        "Consumables/Contingency/Travel": { type: Number},
        "Bootcamps/Events": { type: Number },
        Overhead: { type: Number},
      },
      // 📎 FILE INFO (not actual file)
      // attachmentPath: { type: String },
      attachmentUrl: { type: String },
      attachmentPublicId: { type: String },
      attachmentOriginalName: { type: String },
      pdfHash: { type: String},
      signaturePI: { type: String },
      submittedBy: { type: String},
      payloadPI: { type: String},
      timestamp: Date,
    },
});

const CodeCreation = mongoose.model("CodeCreation", codeCreationSchema);
export default CodeCreation;
