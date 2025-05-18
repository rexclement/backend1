import express from "express";
import { eventUpload } from "../middlewares/upload.js";
import {eventdb, fellowshipdb, missiondb} from "../index.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs-extra";
const router = express.Router();

function getDatabaseByCategory(category) {
  switch (category) {
    case "Evangelism":
      return eventdb;
    case "Fellowship":
      return fellowshipdb;
    case "Mission":
      return missiondb;
    default:
      console.log("Unknown category:", category);
      return null;
  }
}


// CREATE Event (With Image Upload)

// POST event with Cloudinary upload
router.post("/", eventUpload.single("flier"), async (req, res) => {
  try {
   const eventData = {
      ...req.body
   };
    const db = getDatabaseByCategory(eventData.category);
  
   const flierUrl = req.file ? `/uploads/event_fliers/${req.file.filename}` : '/uploads/event_fliers/DEFAULT_FLIER.png';
   eventData.flier = flierUrl;

    const lastEvent = await db.findOne().sort({ order: -1 });
    const nextOrder = lastEvent ? lastEvent.order + 1 : 1;
    eventData.order = nextOrder;
    const newEvent = new db(eventData);

    await newEvent.save();

    res.json(newEvent);
  } catch (error) {
    console.error("Error uploading event:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET all events   useEffect
router.get("/", async (req, res) => {
  try {
    const events = await eventdb.find().sort({ order: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});


router.get("/fellowship", async (req, res) => {
  try {
    const events = await fellowshipdb.find().sort({ order: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});
  
router.get("/mission", async (req, res) => {
  try {
    const events = await missiondb.find().sort({ order: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});




  router.put('/reorder', async (req, res) => {
    
    const { reorderedIds, category } = req.body;
    const db = getDatabaseByCategory(category);
    try {
      const bulkOps = reorderedIds.map(({ id, order }) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(id) }, // <--- convert to ObjectId
          update: { $set: { order } }
        }
      }));
  
      await db.bulkWrite(bulkOps);
  
      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error reordering events:", error);
      res.status(500).json({ error: "Failed to reorder events" });
    }
  });








  
  // UPDATE Event (With Image Upload)
  

  router.put("/:id", eventUpload.single("flier"), async (req, res) => {
    try {
      const eventData = {
      ...req.body
      };
      const updateData = {
        ...eventData
      };
      const db = getDatabaseByCategory(eventData.category);
      const event = await db.findById(req.params.id);
  
       if (req.file) {
        updateData.flier = `/uploads/event_fliers/${req.file.filename}`;
      }
      
      if (req.body.flier_condition === "default") {
        updateData.flier = '/uploads/event_fliers/DEFAULT_FLIER.png';
      }else{
        updateData.flier = event.flier;
      }

      const updatedEvent = await db.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });
  
      res.json(updatedEvent);
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  
 

  router.delete("/delete/:id", async (req, res) => {
     const category = req.body.category;
     const db = getDatabaseByCategory(category);
    try {
      const event = await db.findById(req.params.id);
  
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
  
      

      // Step 1: Delete the file if it's not the default one
      if (event.flier && !event.flier.includes("DEFAULT_FLIER")) {
        const fileName = path.basename(event.flier);
        const filePath = path.join(__dirname, "../uploads/event_fliers/", fileName);
  
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("File delete failed:", err);
          } else {
            console.log("File deleted");
          }
        });
      }
  
      // Step 2: Find all events with a higher order
      const affectedEvents = await db.find({ order: { $gt: event.order } });
  
      // Step 3: Decrease the order of each affected event
      const bulkOps = affectedEvents.map((e) => ({
        updateOne: {
          filter: { _id: e._id },
          update: { $inc: { order: -1 } },
        },
      }));
  
      if (bulkOps.length > 0) {
        await db.bulkWrite(bulkOps);
        console.log("Orders updated");
      }
  
      // Step 4: Delete event
      await db.findByIdAndDelete(req.params.id);
      console.log("Event deleted from DB");
  
      res.json({ message: "Event deleted successfully and order updated" });
    } catch (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  







  

  export default router;