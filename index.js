import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import filesRoutes from "./routes/files.js";
import authRoutes from "./routes/auth.js";
import { randomUUID } from "crypto";

// CONFIGURATIONS

//This is only when you use type module in package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(express.json());
//To console log any request comming to backend, morgan is used
app.use(morgan("common"));
app.use(cors());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// FILE STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/pdf");
  },
  filename: function (req, file, cb) {
    const uniqueName = randomUUID() + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.use("/public/pdf", express.static(path.join(__dirname, "public/pdf")));
app.use(
  "/public/modified",
  express.static(path.join(__dirname, "public/modified"))
);

app.use("/", authRoutes);
app.use("/files", upload.single("pdf"), filesRoutes);

// MONGOOSE SETUP
const port = process.env.PORT || 6001;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => app.listen(port, () => console.log(`Server Port ${port}`)))
  .catch((error) => console.log(error));
