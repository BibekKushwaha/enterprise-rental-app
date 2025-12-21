import express from "express";
import {getProperties,getProperty,createProperty, getPropertyLeases} from "../controller/property.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage:storage});

router.get("/",getProperties);
router.get("/:id/leases", authMiddleware(["manager", "tenant"]), getPropertyLeases);

router.get("/:id",getProperty);

router.post("/",authMiddleware(["manager"]),upload.array("photos") ,createProperty);
// router.post("/",authMiddleware(["manager"]),createProperty);


export default router;