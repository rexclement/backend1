import express from "express";
import {Documentdb} from "../index.js";
import { documentUpload } from"../middlewares/upload.js"; // use the correct path
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from 'url';
const router = express.Router();

// Emulate __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// old document
router.get("/", async (req, res) => {
    try {
      const documents = await Documentdb.find();
  
      // Group documents by category
      const groupedDocs = {
        minutes: [],
        reports: [],
        schedule: [],
        songSheets: [],
        others: [],
      };
  
      documents.forEach((doc) => {
        if (groupedDocs[doc.category]) {
          groupedDocs[doc.category].push({
            name: doc.name,
            fileUrl: doc.fileUrl,
          });
        } else {
          groupedDocs.others.push({
            name: doc.name,
            fileUrl: doc.fileUrl,
          });
        }
      });
  
      res.json(groupedDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });



// Upload document
router.post("/add", documentUpload.single("file"), async (req, res) => {
  try {
    const { category } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/documents/${file.filename}`;
    
        const newDoc = new Documentdb({
          name: file.originalname,
          category,
          fileUrl,
        });

        await newDoc.save();

        return res.status(201).json({
          category,
          name: file.originalname,
          fileUrl,
        });
  } catch (err) {
    console.error("Document upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});





router.delete("/delete", async (req, res) => {
  try {
   
    const { fileUrl } = req.body;

   // Delete from database
   const doc = await Documentdb.findOneAndDelete({ fileUrl });

    if (!doc) return res.status(404).json({ message: "Document not found" });
    
  
      const uploadsDir = path.join(__dirname, "..", "uploads", "documents");
      const fileName = path.basename(fileUrl);
      const filePath = path.join(uploadsDir, fileName);

       if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
      }
  

    // Step 4: Get and group remaining documents
    const allDocs = await Documentdb.find();

    const groupedDocs = {
      minutes: [],
      reports: [],
      schedule: [],
      songSheets: [],
      others: [],
    };

    allDocs.forEach((doc) => {
      if (groupedDocs[doc.category]) {
        groupedDocs[doc.category].push({
          name: doc.name,
          fileUrl: doc.fileUrl,
        });
      } else {
        groupedDocs.others.push({
          name: doc.name,
          fileUrl: doc.fileUrl,
        });
      }
    });

    res.status(200).json(groupedDocs);
  } catch (err) {
    console.error("Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});



 export default router;