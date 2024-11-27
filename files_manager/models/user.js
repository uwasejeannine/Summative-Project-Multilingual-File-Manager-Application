/**
 * User model module.
 * 
 * This module defines the User model using Mongoose.
 * It exports the User model.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User schema definition.
 * 
 * This schema defines the structure of the User document in the database.
 * It includes fields for username, email, password, and a reference to files.
 */
const userSchema = new mongoose.Schema({
  /**
   * Username.
   * 
   * The username chosen by the user.
   */
  username: String,

  /**
   * Email.
   * 
   * The email address of the user.
   */
  email: String,

  /**
   * Password.
   * 
   * The password of the user, hashed for security.
   */
  password: String,

  /**
   * Files.
   * 
   * An array of references to files owned by the user.
   */
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
});

/**
 * Pre-save hook: hash password.
 * 
 * This function is called before the user document is saved to the database.
 * It hashes the password using bcrypt.
 * 
 * @param {function} next - Callback function to be invoked after hashing is complete.
 * @returns {void}
 */
userSchema.pre('save', async function(next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/**
 * Compare password method.
 * 
 * This method compares a given password with the hashed password stored in the database.
 * 
 * @param {string} password - The password to compare.
 * @returns {boolean} True if the password matches, false otherwise.
 */
userSchema.methods.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * User model.
 * 
 * This is the Mongoose model for the User document.
 */
const User = mongoose.model('User', userSchema);

/**
 * Export the User model.
 */
module.exports = User;