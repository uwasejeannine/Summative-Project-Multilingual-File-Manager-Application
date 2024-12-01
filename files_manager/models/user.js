/**
 * User model module.
 * 
 * Defines the User model using Mongoose.
 * Exports the User model.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User schema definition.
 * 
 * Defines the structure of the User document in the database.
 */
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  files: [{ type: String, ref: 'File' }]
});

/**
 * Pre-save hook: hash password.
 * 
 * Hashes the password using bcrypt before saving the user document.
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
 * Compares a given password with the hashed password stored in the database.
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
 * Mongoose model for the User document.
 */
const User = mongoose.model('User', userSchema);

module.exports = User;