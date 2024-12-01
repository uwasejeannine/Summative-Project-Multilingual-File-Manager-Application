/**
 * Passport.js configuration file.
 * 
 * This file sets up the local strategy for Passport.js and configures how
 * user objects are serialized and deserialized.
 */

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

/**
 * Local strategy for Passport.js.
 * 
 * This strategy is used to authenticate users with a username and password.
 * It takes a callback function that is called when a user tries to log in.
 * The function takes three arguments: `username`, `password`, and `done`.
 * The `done` function is used to pass the result of the authentication to Passport.
 */
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

/**
 * Serialize user function for Passport.js.
 * 
 * This function is called during login to serialize the user object.
 * It takes two arguments: `user` and `done`.
 * The `done` function is used to pass the serialized user object to Passport.
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user function for Passport.js.
 * 
 * This function is called during every request to deserialize the user object.
 * It takes two arguments: `id` and `done`.
 * The `done` function is used to pass the deserialized user object to Passport.
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err);
  }
});

/**
 * Export the Passport object.
 * 
 * This allows other parts of the application to use Passport.js for authentication.
 */
module.exports = passport;