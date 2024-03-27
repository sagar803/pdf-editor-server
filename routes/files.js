import express from "express";
import { upload } from "../controllers/files.js";

const router = express.Router();

router.post("/", upload);

export default router;
