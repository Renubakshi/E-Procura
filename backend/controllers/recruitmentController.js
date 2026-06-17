import Recruitment from "../models/recruitmentModel.js";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import CodeCreation from "../models/codeCreation.js";
import User from "../models/user.js";
import uploadPdfToCloudinary from "../utils/uploadPdfToCloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateApprovalLetter = async (req, res) => {
  try {
    if (req.user.role !== "PI") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const data = req.body;
    const currentDate = new Date().toLocaleDateString("en-GB");
    // Load Template

    const templatePath = path.join(
      __dirname,
      "../templates/approvalLetter.ejs",
    );

    // Render HTML

    const logoBase64 = fs.readFileSync(
      path.join(__dirname, "../assets/iit-logo.png"),
      "base64",
    );

    const g20Base64 = fs.readFileSync(
      path.join(__dirname, "../assets/g20-logo.png"),
      "base64",
    );

    const azadiBase64 = fs.readFileSync(
      path.join(__dirname, "../assets/azadi-logo.png"),
      "base64",
    );

    const html = await ejs.renderFile(templatePath, {
      ...data,
      currentDate,

      logoBase64,
      g20Base64,
      azadiBase64,
    });

    const headerTemplate = `
        <div style="
            width:100%;
            padding:0 25px;
            box-sizing:border-box;
            font-family:'Times New Roman';
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                width:100%;
            ">

                <div>
                    <img
                        src="data:image/png;base64,${logoBase64}"
                        style="
                            width:90px;
                            height:auto;
                        "
                    />
                </div>

                <div style="
                    text-align:right;
                    color:#4b3f8f;
                    line-height:1.15;
                    flex:1;
                    margin-top:4px;
                ">

                    <div style="
                        font-size:22px;
                        font-weight:bold;
                    ">
                        भारतीय प्रौद्योगिकी संस्थान भिलाई
                    </div>

                    <div style="
                        font-size:13px;
                        margin-top:2px;
                    ">
                        जिला-दुर्ग, छत्तीसगढ़-491001
                    </div>

                    <div style="
                        font-size:21px;
                        font-weight:bold;
                        margin-top:4px;
                    ">
                        Indian Institute of Technology, Bhilai
                    </div>

                    <div style="
                        font-size:13px;
                        margin-top:2px;
                    ">
                        Dist.- Durg, Chhattisgarh - 491001
                    </div>

                    <div style="
                        font-size:13px;
                        color:#1a4ea1;
                        margin-top:2px;
                    ">
                        Website: www.iitbhilai.ac.in
                    </div>

                </div>

            </div>

        </div>
    `;

    const footerTemplate = `
        <div style="
            width:100%;
            padding:0 25px;
            box-sizing:border-box;
            font-size:10px;
            font-family:'Times New Roman';
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                width:100%;
            ">

                <!-- LEFT LOGO -->

                <div style="width:70px;">
                    <img
                        src="data:image/png;base64,${g20Base64}"
                        style="
                            width:65px;
                            height:auto;
                        "
                    />
                </div>

                <!-- CENTER TEXT -->

                <div style="
                    flex:1;
                    text-align:center;
                    line-height:1.4;
                ">

                    Indian Institute of Technology, Bhilai – 491001, Durg district

                    <br>

                    rndoffice@iitbhilai.ac.in

                    <br>

                    Page
                    <span class="pageNumber"></span>
                    of
                    <span class="totalPages"></span>

                </div>

                <!-- RIGHT LOGO -->

                <div style="
                    width:70px;
                    text-align:right;
                ">

                    <img
                        src="data:image/png;base64,${azadiBase64}"
                        style="
                            width:55px;
                            height:auto;
                        "
                    />

                </div>

            </div>

        </div>
    `;

    // Launch Browser

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html);

    // Generate PDF

    const pdfBuffer= await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
    });
    const pdfUrl = await uploadPdfToCloudinary(pdfBuffer,"e-procura-generated-pdfs",`approval-letter-${Date.now()}.pdf`);

    await browser.close();

    res.status(200).json({
      success: true,
      message: "Approval Letter Generated",
      pdf: pdfUrl.secure_url,
    });
  } catch (error) {
    console.error("Generate approval letter error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const createRecruitmentAdvertisement = async (req, res) => {
  try {
    if (req.user.role !== "PI") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    // =========================
    // SAVE DATA IN DATABASE
    // =========================
    const bodyData = JSON.parse(req.body.data);

    // =========================
    // DIGITAL SIGNATURE VERIFY
    // =========================

    if (!req.body.payload) {
      return res.status(400).json({
        success: false,
        message: "Payload missing",
      });
    }

    if (!req.body.signature) {
      return res.status(400).json({
        success: false,
        message: "Signature missing",
      });
    }

    // Parse payload
    const parsedPayload = JSON.parse(req.body.payload);

    // Find PI user
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user || !user.publicKey) {
      return res.status(404).json({
        success: false,
        message: "Public key not found",
      });
    }

    // Verify signature
    const verify = crypto.createVerify("RSA-SHA256");

    verify.update(req.body.payload);

    verify.end();

    const isValid = verify.verify(
      user.publicKey,
      Buffer.from(req.body.signature, "base64"),
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid private key uploaded. Signature verification failed",
      });
    }
    const formattedData = {
      projectTitle: bodyData.projectTitle,
      projectCode: bodyData.projectCode,
      sponsoringAgency: bodyData.sponsoringAgency,
      piName: bodyData.piName,
      piDesignation: bodyData.piDesignation,
      piDepartment: bodyData.piDepartment,
      officeAddress: bodyData.officeAddress,
      piEmail: bodyData.piEmail,
      requestedBy: req.user.email,
      piWebsite: bodyData.piWebsite,
      positions: bodyData.positions.map((position) => ({
        positionName: position.positionName,
        numberOfPosts: position.numberOfPosts,
        ageLimit: position.ageLimit,
        salaryStart: position.salaryStart,
        salaryEnd: position.salaryEnd,
        duration: position.duration,
        essentialQualifications: position.essentialQualifications,
        desirableQualifications: position.desirableQualifications,
      })),
      process: bodyData.process,
      fundHead: bodyData.fundHead,
      fundHeadAmount: bodyData.fundHeadAmount,
      requestedAmount: bodyData.requestedAmount,

      approvalLetterPath: bodyData.approvalLetterPath,
      submissionEmail: bodyData.submissionEmail,
      emailSubject: bodyData.emailSubject,
      submissionDeadline: bodyData.submissionDeadline,

      interviewDate: bodyData.interviewDate || "To be announced",
      interviewMode: bodyData.interviewMode || "Offline",
      venue: bodyData.venue,
      reportingTime: bodyData.reportingTime,
      committeeMembers: bodyData.committeeMembers,
      attachment: req.file?.path,
      signaturePI: req.body.signature,
    };

    // ======================================
    // FIND PROJECT
    // ======================================

    const project = await CodeCreation.findOne({
      projectCode: bodyData.projectCode,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ======================================
    // FUND DETAILS
    // ======================================

    const fundHead = bodyData.fundHead;
    const requestedAmount = Number(bodyData.requestedAmount) || 0;
    const currentFund = project.piSubmissions?.divisionHeads?.[fundHead] || 0;

    // ======================================
    // INSUFFICIENT FUND CHECK
    // ======================================

    if (requestedAmount > currentFund) {
      return res.status(400).json({
        success: false,
        message: "Insufficient available fund",
      });
    }

    // ======================================
    // BLOCK FUND
    // ======================================

    project.piSubmissions.divisionHeads[fundHead] =
      currentFund - requestedAmount;

    await project.save();

    const recruitment = await Recruitment.create(formattedData);

    // =========================
    // LOAD TEMPLATE
    // =========================

    const templatePath = path.join(
      __dirname,
      "../templates/recruitmentAdvertisement.ejs",
    );

    // =========================
    // LOAD LOGOS
    // =========================

    const logoBase64 = fs.readFileSync(
      path.join(__dirname, "../assets/iit-logo.png"),
      "base64",
    );

    const g20Base64 = fs.readFileSync(
      path.join(__dirname, "../assets/g20-logo.png"),
      "base64",
    );

    const azadiBase64 = fs.readFileSync(
      path.join(__dirname, "../assets/azadi-logo.png"),
      "base64",
    );

    // =========================
    // RENDER HTML
    // =========================

    const html = await ejs.renderFile(templatePath, {
      ...recruitment.toObject(),

      logoBase64,
      g20Base64,
      azadiBase64,
    });

    const headerTemplate = `
        <div style="
            width:100%;
            padding:0 25px;
            box-sizing:border-box;
            font-family:'Times New Roman';
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                width:100%;
            ">

                <div>
                    <img
                        src="data:image/png;base64,${logoBase64}"
                        style="
                            width:90px;
                            height:auto;
                        "
                    />
                </div>

                <div style="
                    text-align:right;
                    color:#4b3f8f;
                    line-height:1.15;
                    flex:1;
                    margin-top:4px;
                ">

                    <div style="
                        font-size:22px;
                        font-weight:bold;
                    ">
                        भारतीय प्रौद्योगिकी संस्थान भिलाई
                    </div>

                    <div style="
                        font-size:13px;
                        margin-top:2px;
                    ">
                        जिला-दुर्ग, छत्तीसगढ़-491001
                    </div>

                    <div style="
                        font-size:21px;
                        font-weight:bold;
                        margin-top:4px;
                    ">
                        Indian Institute of Technology, Bhilai
                    </div>

                    <div style="
                        font-size:13px;
                        margin-top:2px;
                    ">
                        Dist.- Durg, Chhattisgarh - 491001
                    </div>

                    <div style="
                        font-size:13px;
                        color:#1a4ea1;
                        margin-top:2px;
                    ">
                        Website: www.iitbhilai.ac.in
                    </div>

                </div>

            </div>

        </div>
    `;

    const footerTemplate = `
        <div style="
            width:100%;
            padding:0 25px;
            box-sizing:border-box;
            font-size:10px;
            font-family:'Times New Roman';
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                width:100%;
            ">

                <!-- LEFT LOGO -->

                <div style="width:70px;">
                    <img
                        src="data:image/png;base64,${g20Base64}"
                        style="
                            width:65px;
                            height:auto;
                        "
                    />
                </div>

                <!-- CENTER TEXT -->

                <div style="
                    flex:1;
                    text-align:center;
                    line-height:1.4;
                ">

                    Indian Institute of Technology, Bhilai – 491001, Durg district

                    <br>

                    rndoffice@iitbhilai.ac.in

                    <br>

                    Page
                    <span class="pageNumber"></span>
                    of
                    <span class="totalPages"></span>

                </div>

                <!-- RIGHT LOGO -->

                <div style="
                    width:70px;
                    text-align:right;
                ">

                    <img
                        src="data:image/png;base64,${azadiBase64}"
                        style="
                            width:55px;
                            height:auto;
                        "
                    />

                </div>

            </div>

        </div>
    `;

    // =========================
    // LAUNCH BROWSER
    // =========================

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html);


    // =========================
    // GENERATE PDF
    // =========================
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
    });

    await browser.close();
const uploadResult = await uploadPdfToCloudinary(pdfBuffer,"e-procura-generated-pdfs",`recruitment-${Date.now()}.pdf`);
    // =========================
    // SAVE PDF PATH
    // =========================

    recruitment.recruitmentAdPath = uploadResult.secure_url;

    await recruitment.save();

    // =========================
    // RESPONSE
    // =========================

    res.status(201).json({
      success: true,
      message: "Recruitment Advertisement Generated",
      pdf: uploadResult,
      recruitment,
    });
  } catch (error) {
    console.error("Recruitment advertisement error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllRecruitments = async (req, res) => {
  try {
    // ======================================
    // FETCH ALL RECRUITMENTS
    // ======================================

    const recruitments = await Recruitment.find().sort({
      createdAt: -1,
    });

    // ======================================
    // ENRICH WITH LIVE FUND DATA
    // ======================================

    const updatedRecruitments = await Promise.all(
      recruitments.map(async (recruitment) => {
        // Find actual project

        const project = await CodeCreation.findOne({
          projectCode: recruitment.projectCode,
        });

        // Live fund balance from CodeCreation

        const liveFundAmount =
          project?.piSubmissions?.divisionHeads?.[recruitment.fundHead] || 0;

        return {
          ...recruitment.toObject(),

          // overwrite stale value with live value

          fundHeadAmount: liveFundAmount,

          remainingFund: liveFundAmount - (recruitment.requestedAmount || 0),
        };
      }),
    );

    // ======================================
    // RESPONSE
    // ======================================

    res.status(200).json({
      success: true,
      recruitments: updatedRecruitments,
    });
  } catch (error) {
    console.error("Get recruitments error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const approveRecruitment = async (req, res) => {
  try {
    if (req.user.role !== "DORD") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = req.params;

    const payload = JSON.parse(req.body.payload);

    const signatureDean = req.body.signatureDean;

    const signedApprovalPdf = req.file ? `/uploads/${req.file.filename}` : "";

    // ======================================
    // FIND DEAN
    // ======================================

    const deanUser = await User.findOne({
      role: "DORD",
    });

    if (!deanUser) {
      return res.status(404).json({
        success: false,
        message: "Dean not found",
      });
    }

    // ======================================
    // VERIFY SIGNATURE
    // ======================================

    const verify = crypto.createVerify("RSA-SHA256");

    verify.update(JSON.stringify(payload));

    verify.end();

    const isValid = verify.verify(
      deanUser.publicKey,
      Buffer.from(signatureDean, "base64"),
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid private key uploaded. Signature verification failed",
      });
    }

    // ======================================
    // FIND RECRUITMENT
    // ======================================

    const recruitment = await Recruitment.findById(id);

    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    // ======================================
    // PREVENT DOUBLE APPROVAL
    // ======================================

    if (recruitment.deanDecision?.action === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Recruitment already approved",
      });
    }

    // ======================================
    // UPDATE STATUS
    // ======================================

    recruitment.status = "Approved";

    recruitment.approvedAt = new Date();

    recruitment.approvedBy = "Dean";

    recruitment.deanDecision = {
      action: "APPROVED",
      signedBy: "Dean",
      signatureDean,
      payload,
      timestamp: new Date(),
    };

    recruitment.signedApprovalPdf = signedApprovalPdf;

    await recruitment.save();

    // ======================================
    // RESPONSE
    // ======================================

    res.status(200).json({
      success: true,
      message: "Recruitment Approved",
      recruitment,
    });
  } catch (error) {
    console.error("Approve recruitment error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

const rejectRecruitment = async (req, res) => {
  try {
    if (req.user.role !== "DORD") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    const { payload, signatureDean } = req.body;

    // ======================================
    // FIND DEAN
    // ======================================

    const deanUser = await User.findOne({
      role: "DORD",
    });

    if (!deanUser) {
      return res.status(404).json({
        success: false,
        message: "Dean not found",
      });
    }

    // ======================================
    // VERIFY SIGNATURE
    // ======================================

    const verify = crypto.createVerify("RSA-SHA256");

    verify.update(JSON.stringify(payload));

    verify.end();

    const isValid = verify.verify(
      deanUser.publicKey,
      Buffer.from(signatureDean, "base64"),
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid private key uploaded. Signature verification failed",
      });
    }

    // FIND RECRUITMENT

    const recruitment = await Recruitment.findById(id);

    if (!recruitment) {
      return res.status(404).json({
        success: false,
        message: "Recruitment not found",
      });
    }

    // ======================================
    // PREVENT DOUBLE REJECTION
    // ======================================

    if (recruitment.deanDecision?.action === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Recruitment already rejected",
      });
    }

    // ======================================
    // FIND PROJECT
    // ======================================

    const project = await CodeCreation.findOne({
      projectCode: recruitment.projectCode,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ======================================
    // FUND DETAILS
    // ======================================

    const fundHead = recruitment.fundHead;

    const requestedAmount = Number(recruitment.requestedAmount) || 0;

    // ======================================
    // REFUND BLOCKED FUND
    // ======================================

    project.piSubmissions.divisionHeads[fundHead] += requestedAmount;

    await project.save();

    // ======================================
    // UPDATE STATUS
    // ======================================

    recruitment.status = "Rejected";

    recruitment.deanDecision = {
      action: "REJECTED",
      reason: payload.reason,
      signedBy: "Dean",
      signatureDean,
      payload,
      timestamp: new Date(),
    };

    await recruitment.save();

    // ======================================
    // RESPONSE
    // ======================================

    res.status(200).json({
      success: true,
      message: "Recruitment Rejected & Fund Released",
      recruitment,
    });
  } catch (error) {
console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
// get fund request status
const getMyRequests = async (req, res) => {
  try {
    const requests = await Recruitment.find({
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

export {
  generateApprovalLetter,
  createRecruitmentAdvertisement,
  getAllRecruitments,
  approveRecruitment,
  rejectRecruitment,
  getMyRequests,
};
