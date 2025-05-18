// const mongoose = require('mongoose');
// // require("dotenv").config({path: "./config.env"})
// require('dotenv').config();
// const uri = process.env.ATLAS_URI;
// const connectToMongo = async () => {
//     try {
//       await mongoose.connect(uri, {
//         useNewUrlParser: true, // Still recommended
//         useUnifiedTopology: true 
  
//       });
//       console.log("Connected to MongoDB successfully");
//     } catch (error) {
//       console.error("Failed to connect to MongoDB", error);
//     }
//   };
  
//   module.exports = connectToMongo;


import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectToDatabases = async () => {
  try {
    const db1 = mongoose.createConnection(process.env.ATLAS_URI_DB1);
    const db2 = mongoose.createConnection(process.env.ATLAS_URI_DB2);

    db1.on('connected', () => console.log('Connected to DB1'));
    db2.on('connected', () => console.log('Connected to DB2'));

    db1.on('error', (err) => console.error('DB1 connection error:', err));
    db2.on('error', (err) => console.error('DB2 connection error:', err));

    await Promise.all([
      new Promise((resolve, reject) => db1.once('open', resolve).on('error', reject)),
      new Promise((resolve, reject) => db2.once('open', resolve).on('error', reject)),
    ]);

    return { db1, db2 };
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    throw error;
  }
};

export default connectToDatabases;
