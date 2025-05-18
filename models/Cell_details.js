import mongoose from "mongoose";

const CollegeCellSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    prayerCellName: { type: String, required: true },
    cellType: { type: String },
    locationType: { type: String },
    gender: { type: String }, // Storing the image URL
    timesHeld: { type: Number },
    avgParticipants: { type: Number },
    handledBy: { type: String },
    remark: { type: String },
    order: Number,
});



const SchoolCellSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    prayerCellName: { type: String, required: true },
    cellType: { type: String },
    locationType: { type: String },
    gender: { type: String }, // Storing the image URL
    timesHeld: { type: Number },
    avgParticipants: { type: Number },
    handledBy: { type: String },
    remark: { type: String },
    order: Number,
});



export {
    CollegeCellSchema,
    SchoolCellSchema
};