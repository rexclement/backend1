import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: String,
  role: String,
  priority: Number,
  description: String,
  photo: String, // Store photo URL
});

 
export default memberSchema;