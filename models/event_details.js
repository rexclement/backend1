
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    year: { type: String, required: true },
    date: { type: String },
    place: { type: String },
    flier: { type: String }, // Storing the image URL
    description: { type: String },
    outcome: { type: String },
    Accepted_Jesus: { type: Number }, // camelCase for consistency
    Non_Christian_Accept_Jesus: { type: Number }, // camelCase and removed comma
    order: Number,
});

const Fellowship = new mongoose.Schema({
    eventName: { type: String, required: true },
    year: { type: String, required: true },
    date: { type: String },
    place: { type: String },
    flier: { type: String }, // Storing the image URL
    participants_count: { type: Number },
    description: { type: String },
    outcome: { type: String },
    NOSCTGIC: { type: Number }, // No of Students Committed to Grow In Christ
    order: Number,
});

const Mission = new mongoose.Schema({
    eventName: { type: String, required: true },
    year: { type: String, required: true },
    date: { type: String },
    place: { type: String },
    flier: { type: String }, // Storing the image URL
    participants_count: { type: Number },
    description: { type: String },
    outcome: { type: String },
    TM: { type: Number },   // Tent Making
    FM: { type: Number },   // Full Time Ministry
    STC: { type: Number },  // Short Time Coordinator
    SMNI: { type: Number }, // Student Ministry in North India
    INLMBM: { type: Number }, // Interested in Learning More About Ministry
    order: Number,
});

export {EventSchema, Fellowship, Mission} ;
