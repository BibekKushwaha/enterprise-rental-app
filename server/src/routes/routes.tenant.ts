import express from "express";
import { addFavoriteProperty, createTanent, getCurrentResidence, getTanent ,removeFavoriteProperty,updateTanent} from "../controller/tenat.controller.ts";

const router = express.Router();

router.get("/:cognitoId",getTanent);
router.put("/:cognitoId",updateTanent);
router.get("/:cognitoId/current-residences",getCurrentResidence);
router.post("/",createTanent);
router.post("/:cognitoId/favorites/:propertyId",addFavoriteProperty);
router.delete("/:cognitoId/favorites/:propertyId",removeFavoriteProperty);

export default router;