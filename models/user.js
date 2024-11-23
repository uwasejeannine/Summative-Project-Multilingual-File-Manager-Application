// models/User.js

/**
 * Import required modules.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Define the user schema.
 * 
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
  /**
   * The username of the user.
   * 
   * @type {String}
   * @required
   * @unique
   */
  username: { type: String, required: true, unique: true },
  
  /**
   * The email of the user.
   * 
   * @type {String}
   * @required
   * @unique
   */
  email: { type: String, required: true, unique: true },
  
  /**
   * The password of the user.
   * 
   * @type {String}
   * @required
   */
  password: { type: String, required: true }
});

/**
 * Pre-save hook to hash the user's password.
 * 
 * @param {Function} next - The next function to call in the middleware chain.
 */
userSchema.pre('save', function(next) {
  const user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

/**
 * Method to compare a given password with the user's password.
 * 
 * @param {String} password - The password to compare.
 * @returns {Promise<Boolean>} - A promise that resolves to true if the password matches, false otherwise.
 */
userSchema.methods.comparePassword = async function(password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

/**
 * Create the User model.
 * 
 * @type {mongoose.Model}
 */
const User = mongoose.model('User', userSchema);

/**
 * Export the User model.
 */
module.exports = User;