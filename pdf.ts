// const PDFDocument = require("pdfkit");
import PDFDocument from "pdfkit";
import fs from "fs";

export function createPdf(text) {
  // Create a document
  const doc = new PDFDocument();

  // Pipe the PDF into a writable stream (e.g., a file)
  doc.pipe(fs.createWriteStream("coverletter.pdf"));

  // Set the font color to black
  doc.fillColor("black");

  // Add text to document at position x: 100, y: 100
  doc.text(text, 100, 100);

  // Finalize the PDF and end the stream
  doc.end();
}
