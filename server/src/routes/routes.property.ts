import express from "express";
import {getProperties,getProperty,createProperty} from "../controller/property.controller.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage:storage});

router.get("/",getProperties);
router.get("/id",getProperty);

router.post("/",authMiddleware(["manager"]),upload.array("photos") ,createProperty);

export default router;