
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    name: String,
    category: {
        type: String,
        enum: ["minutes", "reports", "schedule", "songSheets", "others"]
    },
    fileUrl: String,
});

export default documentSchema;