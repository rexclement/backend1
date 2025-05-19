import {membersdb} from "../index.js" ;
import express from 'express';
import { teamMemberUpload } from '../middlewares/upload.js';
const router = express.Router();
import path from "path";
import fs from "fs-extra";


// Predefined roles (match naming of default images)
const predefinedRoles = [
  "President",
  "Secretary",
  "Treasurer",
  "Prayer Secretary",
  "Outreach Secretary",
  "Cell care secretary",
  "Literature Secretary",
  "Music Secretary",
  "Representative",
  "Senior advisor family",
  "Young Graduate senior advisor",
  "Students ministry Secretary",
  "Staff worker"
];


router.get('/', async (req, res) => {
    try {
      const members = await membersdb.find();
      res.json(members);
    } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });




router.post("/add", teamMemberUpload.single("photo"), async (req, res) => {
  try {
    
    const { name, role, priority, description } = req.body;
    let photoUrl = "";
 

    if (req.file) {
      // Case 1: User uploaded a photo
      photoUrl = `/uploads/team_members/${req.file.filename}`;
    } else {
        photoUrl = "/uploads/team_members/defaults/default.png";
    }

    const newMember = new membersdb({
      name,
      role,
      priority: Number(priority),
      description,
      photo: photoUrl,
    });

    const savedMember = await newMember.save();
    res.json(savedMember);
  } catch (error) {
    console.error("Error saving member:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.put('/:id', teamMemberUpload.single('photo'), async (req, res) => {
  try {
    const { name, description, role, priority } = req.body;
    const member = await membersdb.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }


    if (req.file && req.file.filename) {
      // Delete old Cloudinary image if not a default
      const isDefault = member.photo.includes('team_members/defaults');

      if (!isDefault) {
         const fileName = path.basename(oldPhotoPath); // safely get filename
        const filePath = path.join(__dirname, '../uploads/team_members', fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          
        }
      }
    }
   
    let photoUrl;
    if (req.file) {
        photoUrl = `/uploads/team_members/${req.file.filename}`;
      }else if(req.body.profileOption === "same"){
        photoUrl=member.photo;
      }else{
        photoUrl="/uploads/team_members/defaults/default.png"
      }
    const updatedMember = await membersdb.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        role,
        priority: parseInt(priority),
        photo: photoUrl,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: 'Member update failed' });
    }

    res.json(updatedMember);
  } catch (err) {
    console.error('Error updating member:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



  
  
router.delete('/delete/:id', async (req, res) => {
  try {
    const member = await membersdb.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
   if (member.photo && !member.photo.includes('defaults')) {
        // Only delete the file if it's not a default image
        const fileName = path.basename(member.photo); // safely extract filename
        const filePath = path.join(__dirname, '../uploads/team_members/', fileName);
  
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('File delete failed:', err);
          } else {
            console.log('Member photo deleted');
          }
        });
      }

    // Delete the member from the database
    await membersdb.findByIdAndDelete(req.params.id);
    console.log(' Member deleted from DB');

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting member:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

  

 export default router;

