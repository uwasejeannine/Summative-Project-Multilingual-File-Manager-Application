/**
 * Import required modules.
 */
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
const path = require("path");
const port = 3000;
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");

/**
 * Set up Express.js to parse JSON requests.
 */
app.use(express.json());

/**
 * Define the main URL for the application.
 */
const main_url = "http://localhost:3000";

/**
 * Import routes for file management.
 */
const router = require("../routes/file_routes");

/**
 * Generate a secret key for session encryption.
 */
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('base64');

/**
 * Set up session management with Express.js.
 * 
 * @param {Object} options - Options for session management.
 */
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

/**
 * Connect to the database before starting the server.
 * 
 * @param {Function} callback - Callback function to handle errors.
 */
let db;
connectToDb((error) => {
  if (!error) {
    /**
     * Start the server and listen for incoming requests.
     */
    app.listen(port, () => {
      console.log(`Server is listening at ${main_url}`);
    });
    db = getDb();
  } else {
    console.log(error);
  }
});

/**
 * Initialize Passport.js for authentication.
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * Use the file routes for the application.
 */
app.use(router);