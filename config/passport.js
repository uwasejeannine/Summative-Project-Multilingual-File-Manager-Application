/**
 * Initializes Passport.js and configures the LocalStrategy for authentication.
 * 
 * @module passport
 */

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

/**
 * Configures the LocalStrategy for authentication.
 * 
 * @param {Object} options - The options for the LocalStrategy.
 * @param {Function} verify - The callback function for verifying the credentials.
 * @returns {void}
 */
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Invalid username or password' });
    }
    // Compare the password with the user's password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Invalid username or password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

/**
 * Serializes the user object into the session.
 * 
 * @param {Object} user - The user object.
 * @param {Function} done - The callback function for serialization.
 * @returns {void}
 */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * Deserializes the user object from the session.
 * 
 * @param {string} id - The ID of the user.
 * @param {Function} done - The callback function for deserialization.
 * @returns {void}
 */
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Exports the Passport.js instance.
 * 
 * @returns {Object} The Passport.js instance.
 */
module.exports = passport;