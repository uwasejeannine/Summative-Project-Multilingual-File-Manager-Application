/**
 * Mongoose schema for a session.
 * 
 * This schema defines the structure of a session document in the database.
 * 
 * @type {mongoose.Schema}
 */
const mongoose = require('mongoose');

/**
 * Session schema definition.
 * 
 * This schema has the following properties:
 * 
 * - `userId`: a reference to the User model
 * - `cookie`: an object with properties for the cookie
 * - `createdAt` and `updatedAt`: timestamps for when the session was created and last updated
 */
const sessionSchema = new mongoose.Schema({
  /**
   * Reference to the User model.
   * 
   * This is the ID of the user who owns this session.
   * 
   * @type {mongoose.Schema.Types.ObjectId}
   * @ref {User}
   */
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  /**
   * Cookie data.
   * 
   * This object contains properties for the cookie:
   * 
   * - `path`: the path of the cookie
   * - `expires`: the expiration date of the cookie
   * - `originalMaxAge`: the original maximum age of the cookie
   * - `httpOnly`: whether the cookie is HTTP-only
   * - `secure`: whether the cookie is secure
   * - `sameSite`: the same-site attribute of the cookie
   */
  cookie: {
    path: String,
    expires: Date,
    originalMaxAge: Number,
    httpOnly: Boolean,
    secure: Boolean,
    sameSite: String
  },
  
  /**
   * Timestamp for when the session was created.
   * 
   * This is automatically set to the current date and time when the session is created.
   * 
   * @type {Date}
   * @default {Date.now}
   */
  createdAt: { type: Date, default: Date.now },
  
  /**
   * Timestamp for when the session was last updated.
   * 
   * This is automatically set to the current date and time when the session is updated.
   * 
   * @type {Date}
   * @default {Date.now}
   */
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Session model.
 * 
 * This model represents a session in the database.
 * 
 * @type {mongoose.Model}
 */
const Session = mongoose.model('Session', sessionSchema);

/**
 * Export the Session model.
 * 
 * This allows other parts of the application to use the Session model.
 */
module.exports = Session;