import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getLeasePayments, getLeases } from "../controller/lease.controllers.js";



const router = express.Router();

router.get("/",authMiddleware(["manager", "tenant"]),getLeases);
router.get("/:id/payments",authMiddleware(["manager", "tenant"]),getLeasePayments);

export default router;