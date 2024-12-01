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
      if (existingUser.username === username && existingUser.email === email) {
        errors[username] = req.t('usernameExists1');
        errors[email] = req.t('emailExists1');
      }
      return res.status(400).json({ errors });
    } else {
      const user = new User({
        username,
        email,
        role: req.body.role,
        password: req.body.password
      });
      await user.save();
      const { username: createdUsername, email: createdEmail } = user;
      res.status(201).json({
        message: req.t('user_creat_success', { username: createdUsername, email: createdEmail })
      })
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorCreatingUser') });
  }
}
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

      return res.status(200).json({ message: req.t('loginSuccess', { username }) });
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
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('mustBeLoggedInToGetUser') });
      return;
    } else {
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ message: req.t('userNotFound') });
      } else {
        if (req.user.role === 'admin') {
          res.json(user);
          res.status(200).json({ message: req.t('userFound') });
        }else{
          res.status(401).json({ message: req.t('notAuthorized') });
        }
      }
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
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('loginRequired1') });
      return;
    }
    const userId = req.session.passport.user;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: req.t('userNotFound') });
    } else {
      const { email } = req.body;

      user.email = email;

      const existingUser = await User.findOne({ email: user.email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ errors: { email: req.t('emailExists') } });
      }

      await user.save();
      req.session.passport.user.email = user.email;
      res.redirect('/logout');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorUpdatingUser') });
  }
}
/**
 * Delete a user.
 * 
 * This function allows users to delete their own account.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteUserAccount = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('loginRequired2') });
      return;
    }
    const userId = req.session.passport.user;
    await File.deleteMany({ owner: userId });
    const result = await User.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: req.t('userNotFound') });
    } else {
      req.session.destroy();
      res.status(200).json({ message: req.t('userDeleted1') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingUser') });
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
      res.status(401).json({ message: req.t('loginRequired3') });
      return;
    }
    const userId = req.params.id;
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role === 'admin') {
      await File.deleteMany({ owner: userId });
      const result = await User.deleteOne({ _id: userId });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: req.t('userNotFound') });
      } else {
        // Invalidate the user's session
        const sessions = await Session.find({ userId });
        sessions.forEach((session) => {
          session.destroy((err) => {
            if (err) {
              console.error(err);
            }
          });
        });
        res.status(200).json({ message: req.t('userDeleted') });
      }
    }else{
      res.status(401).json({ message: req.t('notAuthorized') });
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
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('loginRequired4') });
      return;
    }else{
      const currentAdminId = req.session.passport.user;
      const currentUser = await User.findById(currentAdminId);
      if (currentUser.role === 'admin') {
        await File.deleteMany();
        const result = await User.deleteMany();
        if (result.deletedCount === 0) {
          res.status(404).json({ message: req.t('noUsersFound') });
        } else {
          req.session.destroy();
          res.status(200).json({ message: req.t('allUsersDeleted') });
        }
      }else{
        res.status(401).json({ message: req.t('notAuthorized') });
      }
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllUsers') });
  }
    
}


/**
 * Get all users.t
 * 
 * This function retrieves all users.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
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
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('loginRequired5') });
      return;
    }
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role === 'admin') {
      const users = await User.find();
      res.json(users);
    } else {
      res.status(401).json({ message: req.t('notAuthorized') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t("errorGettingAllUsers") });
  }
}



/**
 * Updateb user password.
 * 
 * This function updates the password of a user.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */

exports.updatePassword = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('loginRequired6') });
      return;
    }
    const userId = req.session.passport.user;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: req.t('userNotFound') });
    } else {
      const isValidPassword = await user.comparePassword(req.body.currentPassword);
      if (!isValidPassword) {
        res.status(400).json({ message: req.t('invalidCurrentPassword') });
      } else {
        user.password = req.body.newPassword;
        await user.save();
        res.status(200).json({ message: req.t('passwordUpdated') });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorUpdatingPassword') });
  }
}