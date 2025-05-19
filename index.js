import express from "express";
import bcrypt from "bcryptjs";
import session from "express-session";
import passport from "passport";
import pkg from 'passport-local';
const { Strategy: LocalStrategy } = pkg;

import dotenv from "dotenv";
import cors from "cors";

import  connectToDatabases  from "./connect.js";
import { configureCloudinary } from "./middlewares/cloudinary.js";

import event_router from "./routers/Events.js";
import document_router from "./routers/Document.js";
import members_router from "./routers/Member.js";
import cell_router from "./routers/Prayer_cells.js";



import documentSchema from "./models/documents.js";
import {CollegeCellSchema} from "./models/Cell_details.js";
import { SchoolCellSchema } from "./models/Cell_details.js";
import {EventSchema, Fellowship, Mission} from './models/event_details.js';
import memberSchema from "./models/Members_details.js";
import userSchema from "./models/store.js";
import bodyParser from 'body-parser';
import MongoStore from "connect-mongo";

let membersdb;
let collegedb;
let schooldb;
let eventdb;
let Documentdb;
let Storesdb;
let fellowshipdb;
let missiondb;

dotenv.config();

async function init() {
  const { db1,db2 } = await connectToDatabases();

  membersdb = db2.model('members', memberSchema);
  eventdb = db2.model('Events', EventSchema);
  fellowshipdb = db2.model('Fellowship', Fellowship);
  missiondb = db2.model('Misiion', Mission);
  collegedb = db1.model('college_cell_details', CollegeCellSchema);
  schooldb = db1.model('school_cell_details', SchoolCellSchema);
  Documentdb = db1.model('documentmodels', documentSchema);
  Storesdb = db1.model('stores', userSchema);

}

init();


const saltRounds = 10;
const port = 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);
const allowedOrigins = [
  "http://34.83.205.86:3000",
  "https://rexclement.github.io"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json()); // Enables JSON body parsing






app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.ATLAS_URI_DB2,
    ttl: 60 * 60, // 1 hour in seconds
  }),
  cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
  }
}));

app.use(passport.initialize());
app.use(passport.session());





passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // console.log(username);
    const user = await Storesdb.findOne({ username });
    if (!user) return done(null, false, { message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    // console.log(isValid)
    if (!isValid) return done(null, false, { message: 'Wrong password' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Session serialization
passport.serializeUser((user, done) => {
  
  // Store minimal info in session
  done(null, { id: user._id, username: user.username });
});

passport.deserializeUser(async (sessionUser, done) => {
  
  try {
    const user = await Storesdb.findById(sessionUser.id);
    if (user) {
     
      done(null, { id: user._id, username: user.username });
    } else {
     
      done(null, false);
    }
  } catch (err) {
    console.log("🔥 Error in deserializeUser:", err);
    done(err);
  }
});


function isAuthenticated(req, res, next) {
  
  if (req.isAuthenticated()) {
    return next(); // user is logged in, continue to route
  }else{
    res.redirect('/');
  }
   // not logged in, redirect to /home
}

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: 'Login failed' });

    req.login(user, (err) => {
      if (err) return next(err);

      // Do NOT manually set session fields here.
      return res.json({ success: true, message: 'Login successful', user: user.username });
    });
  })(req, res, next);
});


app.use((req, res, next) => {
  // console.log('Session:', req.session);
  // console.log('User:', req.user);
  next();
});



app.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});



app.use('/events',  event_router);

app.use("/document",document_router);

app.use("/members", members_router);

app.use("/cell",cell_router);





// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));



app.post('/changeme', async (req, res) => {
    const { username, password } = req.body;

  try {
    // Delete all existing user data
    await Storesdb.deleteMany({});

    // Hash the password before saving
    bcrypt.hash(password,saltRounds, async (err,hash) =>{
        if (err){
          console.log("Error Hashing Password:",err);
        }else{
            const newUser = new Storesdb({
                username,
                password: hash
              });
          
              await newUser.save();
        }
      });

    res.json({ message: 'User saved with hashed password.' });

  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
  });

  app.get('/', (req, res) => {
    res.send('Hello from Express on cloud!');
  });
  
  // Export the app as a serverless function
 export { membersdb, collegedb, schooldb, eventdb, Documentdb, fellowshipdb, missiondb}


app.listen(port, () => console.log("Server running on port 5000"));


 