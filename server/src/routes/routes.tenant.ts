import express from "express";
import { createTanent, getTanent ,updateTanent} from "../controller/tenat.controller.ts";

const router = express.Router();

router.get("/:cognitoId",getTanent);
router.put("/:cognitoId",updateTanent);
router.post("/",createTanent);

export default router;