import express from "express";
import { calculateApplianceConsumption } from "../controllers/calculateConsumption.js";

const router = express.Router();

router.get("/calculate-consumption", calculateApplianceConsumption);

export default router;