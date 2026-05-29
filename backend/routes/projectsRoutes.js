import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateProjectCode, createProject,getPIList,getProjects,getBifurcatedProjects, getProjectsById, updateProjectByPI  } from "../controllers/projectRoutesController.js";

// Generate Empld - PI List for rnd form
router.get("/pi-list",getPIList);

// Generate Poject code by RND
router.post("/project-code", generateProjectCode );

// PROJECT CODE FORM CREATED BY RND
router.post("/", createProject);

// PI: GET ALL PROJECTS - Non-bifurcated
router.get("/", auth(["PI"]), getProjects);
// PI: GET ALL PROJECTS - Bifurcated
router.get("/bifurcated", auth(["PI"]), getBifurcatedProjects);

// PI: GET SINGLE PROJECT BY ID
router.get("/:id", getProjectsById);


// UPDATE PROJECT FORM (PI) 
router.patch("/:id", auth(["PI"]), upload.single("attachment"),updateProjectByPI);


// // ================== RND: GET PROJECTS ==================
// router.get("/rnd", async (req, res) => {
//   try {
//     const projects = await Project.find({
//       status: "Sent to R&D",
//     });

//     res.json(projects);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching RND projects" });
//   }
// });


// // ================== APPROVE ==================
// router.put("/:id/approve", async (req, res) => {
//   try {
//     const updated = await Project.findByIdAndUpdate(
//       req.params.id,
//       { status: "Approved by R&D" },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: "Error approving" });
//   }
// });


// // ================== REJECT ==================
// router.put("/:id/reject", async (req, res) => {
//   try {
//     const updated = await Project.findByIdAndUpdate(
//       req.params.id,
//       { status: "Rejected by R&D" },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: "Error rejecting" });
//   }
// });


// Get all projects created by RND
// router.get("/pi-projects/:piEmpId", async (req, res) => {
//   try {
//     const { piEmpId } = req.params;

//     const projects = await CodeCreation.find({
//       piEmpId: piEmpId
//     }).select("projectCode availableFunds transactionId piName");

//     res.json(projects);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

export default router