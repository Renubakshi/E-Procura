import express from "express";
import { auth } from "../middleware/auth.js";
import CodeCreation from "../models/codeCreation.js";
import path from "path";
import fs from "fs";
import crypto from "crypto";
const router = express.Router();
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// manpower hiring form pdf download
router.get("/download-pdf/:fileName", (req, res) => {
  try {
    console.log("download hit");
    
    const { fileName } = req.params;

    const filePath = path.join(
      __dirname,
      "../generated-pdfs",
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.download(filePath, fileName);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// Download project file with tamper check
router.get("/:id", auth(["PI"]), async (req, res) => {
  try {
    const project = await CodeCreation.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Not found" });

    // 🔐 ownership check
    if (project.piEmpId !== req.user.employeeId) {
      return res.status(403).json({ msg: "Unauthorized access" });
    }

    const attachmentPath = project.piSubmissions?.attachmentPath;

    if (!attachmentPath) {
      return res.status(404).json({
        message: "No attachment found",
      });
    }

    const filePath = path.resolve(attachmentPath);

    // file exists check
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        tampered: true,
        message: "File missing",
      });
    }

    // hash check
    const fileBuffer = fs.readFileSync(filePath);
    const newHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    if (newHash !== project.piSubmissions?.pdfHash) {
      return res.status(400).json({
        tampered: true,
        message: "File content tampered",
      });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error reading file" });
  }
});



export default router;
