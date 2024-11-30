/**
 * User controller module.
 * 
 * This module exports several functions for handling user data.
 */
const i18next = require('i18next');

const User = require('../models/user');
const passport = require('../config/passport');
const File = require('../models/files');
const Session = require('../models/session');

/**
 * Create a new user.
 * 
 * This function creates a new user with the provided username, email, and password.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    
    if (existingUser) {
      const errors = {};
      if (existingUser.username === username) {
        errors[username] = req.t('usernameExists');
      }
      if (existingUser.email === email) {
        errors[email] = req.t('emailExists');
      }
      return res.status(400).json({ errors });
    }
    
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    
    await user.save();
    res.status(201).json({
      message: req.t('user_creat_success', { username, email })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorCreatingUser') });
  }
};


/**
 * Log in a user.
 * 
 * This function logs in a user with the provided username and password.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {void}
 */
exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  // Validate user input
  if (!username || !password) {
    return res.status(400).json({ message: req.t('loginRequired') });
  }
  if (req.session.passport) {
    return res.status(401).json({ message: req.t('alreadyLoggedIn', { username }) });
  }
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: req.t('invalidCredentials') });
    }

    // Log in the user
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      const userId = user._id;
      const session = new Session({
        userId: userId,
        cookie: req.session.cookie
      });
      await session.save();

      res.redirect('/getsession');
    });
  })(req, res, next);
}

/**
 * Log out a user.
 * 
 * This function logs out the current user.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.logoutUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('alreadyLoggedOut') });
      return;
    }
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: req.t('errorLoggingOut') });
      } else {
        res.json({ message: req.t('logoutSuccess') });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorLoggingOut') });
  }
}

/**
 * Get a user by ID.
 * 
 * This function retrieves a user by its ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: req.t('userNotFound') });
    } else {
      res.json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingUser') });
  }
}

/**
 * Update a user.
 * 
 * This function updates a user with the provided data.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      res.status(404).json({ message: req.t('userNotFound') });
    } else {
      res.json(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorUpdatingUser') });
  }
}

/**
 * Delete a user.
 * 
 * This function deletes a user by its ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('loginRequired') });
      return;
    }
    const userId = req.session.passport.user;
    await File.deleteMany({ owner: userId });
    const result = await User.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: req.t('userNotFound') });
    } else {
      res.status(200).json({ message: req.t('userDeleted') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingUser') });
  }
}

/**
 * Delete all users.
 * 
 * This function deletes all users.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteAllUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      res.status(404).json({ message: req.t('noUsersFound') });
    } else {
      await User.deleteMany();
      await File.deleteMany();
      res.status(200).json({ message: req.t('allUsersDeleted') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllUsers') });
  }
}

/**
 * Get the current session.
 * 
 * This function retrieves the current session.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getSession = async (req, res) => {
  try {
    res.json(req.session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingSession') });
  }
}

/**
 * Get all users.
 * 
 * This function retrieves all users.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingUsers') });
  }
}
