import CodeCreation from "../models/codeCreation.js";
import crypto from "crypto";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import uploadPdfToCloudinary from "../utils/uploadPdfToCloudinary.js";

// Generate Empld - PI List for rnd form
export const getPIList = async (req, res) => {
  const piList = await User.find({ role: "PI" }).select("fullName employeeId");
  res.json(piList);
};

// Generate Poject code by RND
export const generateProjectCode = async (req, res) => {
  try {
    const { department } = req.body;

    const year = new Date().getFullYear();

    const lastProject = await CodeCreation.findOne({
      department,
      year,
    }).sort({ sequenceNumber: -1 });

    let sequenceNumber = lastProject ? lastProject.sequenceNumber + 1 : 1;

    const paddedSeq = String(sequenceNumber).padStart(4, "0");
    const projectCode = `${year}/${department}/${paddedSeq}`;

    res.status(200).json({ projectCode, sequenceNumber, year });
  } catch (err) {
    res.status(500).json({ message: "Error generating code" });
  }
};

// PROJECT CODE FORM CREATED BY RND
export const createProject = async (req, res) => {
  try {
    // Role check
    if (req.user.role !== "RND") {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const {
      department,
      projectCode,
      totalFundReceived,
      bankTransactionId,
      piEmpId,
      payload,
      sequenceNumber,
      year,
      signature,
    } = req.body;

    const piUser = await User.findOne({
      employeeId: piEmpId,
      role: "PI",
    });

    if (!piUser) {
      return res.status(400).json({
        message: "Invalid PI selected",
      });
    }
    const rndUser = await User.findById(req.user.id);

    if (!rndUser) {
      return res.status(404).json({ message: "RND user not found" });
    }

    const publicKey = rndUser.publicKey;

    const verify = crypto.createVerify("RSA-SHA256"); //verify signature

    verify.update(JSON.stringify(payload));
    verify.end();

    const isValid = verify.verify(publicKey, Buffer.from(signature, "base64"));

    if (!isValid) {
      return res.status(401).json({
        message: "Signature verification failed",
      });
    }
    const exists = await CodeCreation.findOne({ projectCode }); // Insertion in DB

    if (exists) {
      return res.status(400).json({
        message: "Project code already exists",
      });
    }

    const newProject = await CodeCreation.create({
      projectCode,
      department,
      year,
      sequenceNumber,
      totalFundReceived,
      bankTransactionId,
      piEmpId: piUser.employeeId,
      piName: piUser.fullName,
      signature,
      signedBy: rndUser.role,
      payload,
    });

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// PI - Get all Non-Bifurcated Projects
export const getProjects = async (req, res) => {
  try {
    const employeeId = req.user.employeeId; // coming from JWT

    const projects = await CodeCreation.find({
      piEmpId: employeeId, // Must match DB field
      isBifurcated: false,
    }).select("projectCode totalFundReceived bankTransactionId piName");

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PI - Get Bifurcated Projects
export const getBifurcatedProjects = async (req, res) => {
  try {
    const employeeId = req.user.employeeId; // coming from JWT

    const projects = await CodeCreation.find({
      piEmpId: employeeId, // Must match DB field
      isBifurcated: true,
    }).select(
      "projectCode totalFundReceived bankTransactionId piName piSubmissions",
    );

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// PI: GET SINGLE PROJECT BY ID
export const getProjectsById = async (req, res) => {
  try {
    const project = await CodeCreation.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (req.user.role === "PI" && project.piEmpId !== req.user.employeeId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    res.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROJECT FORM (PI) - bifurcation
export const updateProjectByPI = async (req, res) => {
  try {
    if (!req.body.formData)
      return res.status(400).json({ msg: "formData missing" });

    if (!req.body.signature)
      return res.status(400).json({ msg: "signature missing" });

    if (!req.file) return res.status(400).json({ msg: "attachment missing" });

    const parsedForm = JSON.parse(req.body.formData); //string to object
    const email = req.user.email;
    const user = await User.findOne({ email });

    if (!user || !user.publicKey) {
      return res.status(404).json({ msg: "Public key not found" });
    };
    // 🔐 Verify PI signature
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(JSON.stringify(parsedForm));
    verify.end();

    const isValid = verify.verify(
      user.publicKey,
      Buffer.from(req.body.signature, "base64"),
    );

    if (!isValid) {
      return res
        .status(400)
        .json({
          msg: "Invalid private key uploaded. Signature verification failed",
        });
    }

    // 📄 Hash uploaded PDF
    const fileBuffer = req.file.buffer;

    const backendPdfHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    if (parsedForm.pdfHash !== backendPdfHash) {
      return res.status(400).json({ msg: "PDF tampered or mismatch" });
    }

    const project = await CodeCreation.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    // 🔒 Ensure PI owns project
    if (project.piEmpId !== user.employeeId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    const total =
      parsedForm.divisionHeads["Manpower (including Interns)"] +
      parsedForm.divisionHeads["Equipment"] +
      parsedForm.divisionHeads["Consumables/Contingency/Travel"] +
      parsedForm.divisionHeads["Bootcamps/Events"] +
      parsedForm.divisionHeads["Overhead"];

    if (total > project.totalFundReceived) {
      return res.status(400).json({ msg: "Exceeds available funds" });
    }

    // ✅ Append PI submission (NO overwrite)
    const uploadResult = await uploadPdfToCloudinary(
  req.file.buffer,
  "e-procura-uploads",
  req.file.originalname
);

    const piSubmission = {
      title: parsedForm.title,
      divisionHeads: parsedForm.divisionHeads,
      attachmentUrl: uploadResult.secure_url,
      attachmentPublicId: uploadResult.public_id,
      attachmentOriginalName: req.file.originalname,
      pdfHash: parsedForm.pdfHash,
      signaturePI: req.body.signature,
      submittedBy: email,
      payloadPI: req.body.formData,
      timestamp: new Date(),
    };

    // If first time → create array
    if (!project.piSubmissions) {
      project.piSubmissions = {};
    }

    project.piSubmissions = piSubmission;
    project.isBifurcated = true;

    await project.save();

    res.json({
      success: true,
      projectId: project._id,
    });
  } catch (err) {
    console.error("Project update error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
