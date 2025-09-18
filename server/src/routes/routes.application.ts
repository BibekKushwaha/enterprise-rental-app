
import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createApplication, listApplications, updateApplicationStatus } from "../controller/application.controller.js";


const router = express.Router();

router.get("/",authMiddleware(["tenant"]),createApplication);
router.get("/:id/status",authMiddleware(["manager"]),updateApplicationStatus);
router.get("/",authMiddleware(["manager","tenant"]),listApplications);

export default router;
