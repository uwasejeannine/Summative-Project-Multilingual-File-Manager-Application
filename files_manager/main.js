/**
 * Main application file.
 * 
 * This file sets up the Express.js application, connects to the database,
 * and starts the server.
 */

const express = require('express');
const app = express();
const db = require('./database/db');
const routes = require('./routers/allrouters');
const crypto = require('crypto');

/**
 * Generate a secret key for session encryption.
 * 
 * This key is used to encrypt and decrypt session data.
 * 
 * @type {string}
 */
const secretKey = crypto.randomBytes(32).toString('base64');

/**
 * Enable JSON parsing for incoming requests.
 */
app.use(express.json());

/**
 * Set up session management.
 * 
 * This middleware uses the express-session package to manage sessions.
 * 
 * @see https://www.npmjs.com/package/express-session
 */
const session = require('express-session');
app.use(session({
  /**
   * Secret key for session encryption.
   * 
   * This key is used to encrypt and decrypt session data.
   * 
   * @type {string}
   */
  secret: secretKey,
  
  /**
   * Whether to resave the session even if it hasn't changed.
   * 
   * @type {boolean}
   */
  resave: false,
  
  /**
   * Whether to save uninitialized sessions.
   * 
   * @type {boolean}
   */
  saveUninitialized: true,
  
  /**
   * Cookie settings for the session.
   * 
   * @type {object}
   */
  cookie: {
    /**
     * Maximum age of the session cookie in milliseconds.
     * 
     * @type {number}
     */
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
    
    /**
     * Whether the cookie is HTTP-only.
     * 
     * @type {boolean}
     */
    httpOnly: true,
    
    /**
     * Whether the cookie is secure.
     * 
     * @type {boolean}
     */
    secure: false,
    
    /**
     * Same-site attribute for the cookie.
     * 
     * @type {string}
     */
    sameSite: 'lax'
  }
}));

/**
 * Initialize Passport.js.
 * 
 * This middleware uses the passport package to manage authentication.
 * 
 * @see https://www.npmjs.com/package/passport
 */
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

/**
 * Establish the database connection.
 * 
 * This function connects to the database and sets up the schema.
 * 
 * @param {function} callback - Callback function to execute after connection is established.
 */
db.connectToDb((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Database connection established');
    
    /**
     * Use the routes.
     * 
     * This middleware uses the routes defined in the routers directory.
     */
    app.use('/', routes);
    
    /**
     * Start the server.
     * 
     * This function starts the server and listens for incoming requests.
     */
    app.listen(3000, () => {
      console.log('Server listening on port 3000');
    });
  }
});