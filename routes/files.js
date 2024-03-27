import express from "express";
import { getFiles, upload } from "../controllers/files.js";

const router = express.Router();

router.post("/upload", upload);
router.get("/:userId", getFiles);

export default router;
