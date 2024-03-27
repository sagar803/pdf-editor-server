import { PDFDocument } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import File from "../models/File.js";
import { randomUUID } from "crypto";

export const upload = async (req, res) => {
  //This is only when you use type module in package.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  try {
    const selectedPages = JSON.parse(req.body.selectedPages);
    const { userId } = req.body;
    const pdfPath = req.file.path;

    console.log(pdfPath);

    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    let removePage = [];
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      if (!selectedPages.includes(i + 1)) removePage.push(i + 1);
    }

    let numDeletedPages = 0;
    for (const pageNum of removePage) {
      pdfDoc.removePage(pageNum - 1 - numDeletedPages);
      numDeletedPages++;
    }

    const modifiedPdfBytes = await pdfDoc.save();

    const randomId = randomUUID();
    const modifiedToFilePath = `../public/modified/modified_${randomId}.pdf`;

    // // Save modified PDF to public/edited folder with the new filename
    await fs.writeFile(
      path.join(__dirname, modifiedToFilePath),
      modifiedPdfBytes
    );

    const savedFileDate = new File({
      userId,
      filePath: pdfPath,
      modifiedToFilePath,
    });

    await savedFileDate.save();

    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", "attachment; filename=modified.pdf");
    // res.send(Buffer.from(modifiedPdfBytes));
    res.json({ savedFileDate });
    //await fs.unlink(pdfPath);
  } catch (error) {
    console.error("Error extracting pages:", error);
    res.status(500).send("Error extracting pages");
  }
};

export const getFiles = async (req, res) => {
  console.log("hh");
  const { userId } = req.params;
  try {
    const files = await File.find({ userId });
    res.status(200).json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files");
  }
};
