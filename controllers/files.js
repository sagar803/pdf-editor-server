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
    const editedPdfPath = path.join(
      __dirname,
      `../public/modified/modified_${randomId}.pdf`
    );

    // Save modified PDF to public/edited folder with the new filename
    await fs.writeFile(editedPdfPath, modifiedPdfBytes);

    const saveFileDate = new File({
      userId,
      filePath: pdfPath,
      modifiedToFilePath: editedPdfPath,
    });

    await saveFileDate.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=modified.pdf");
    res.send(Buffer.from(modifiedPdfBytes));

    await fs.unlink(pdfPath);
  } catch (error) {
    console.error("Error extracting pages:", error);
    res.status(500).send("Error extracting pages");
  }
};
