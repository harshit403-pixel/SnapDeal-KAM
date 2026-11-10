import { Router } from "express";
import { getSeller } from "../modules/seller/seller.controller.js";

const router = Router();
router.get("/", getSeller);
export default router;
