/**
 * User controller module.
 * 
 * This module exports several functions for handling user data such as creating, logging in, logging out, updating, and deleting users.
 */
const i18next = require('i18next');
const User = require('../model/user.test');
const passport = require('../../config/passport');
const File = require('../model/file.test');

/**
 * Create a new user.
 * 
 * This function creates a new user with the provided username, email, and password.
 * If the username or email already exists, an error is returned.
 * 
 * @param {object} req - The request object containing user data.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, role, password } = req.body;
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
    }

    const user = new User({ username, email, role, password });
    await user.save();

    res.status(201).json({
      message: req.t('user_creat_success', { username: user.username, email: user.email })
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
 * @param {object} req - The request object containing login credentials.
 * @param {object} res - The response object to send the result.
 * @param {function} next - The next middleware function in the chain.
 * @returns {void}
 */
exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;

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

    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      const session = new Session({ userId: user._id, cookie: req.session.cookie });
      await session.save();

      res.status(200).json({ message: req.t('loginSuccess', { username }) });
    });
  })(req, res, next);
};

/**
 * Log out a user.
 * 
 * This function logs out the current user and destroys the session.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.logoutUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('alreadyLoggedOut') });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: req.t('errorLoggingOut') });
      }
      res.json({ message: req.t('logoutSuccess') });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorLoggingOut') });
  }
};

/**
 * Get a user by ID.
 * 
 * This function retrieves a user by its ID. Only accessible to authenticated users.
 * 
 * @param {object} req - The request object containing the user ID.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.getUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToGetUser') });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: req.t('userNotFound') });
    }

    if (req.user.role === 'admin') {
      return res.json(user);
    } else {
      return res.status(401).json({ message: req.t('notAuthorized') });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingUser') });
  }
};

/**
 * Update a user's email.
 * 
 * This function updates the email of a user. It checks for email conflicts before saving.
 * 
 * @param {object} req - The request object containing the new email.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.updateUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('loginRequired1') });
    }

    const userId = req.session.passport.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: req.t('userNotFound') });
    }

    const { email } = req.body;
    user.email = email;

    const existingUser = await User.findOne({ email: user.email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ errors: { email: req.t('emailExists') } });
    }

    await user.save();
    req.session.passport.user.email = user.email;

    res.status(200).json({ message: req.t('userUpdated') });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorUpdatingUser') });
  }
};

/**
 * Delete a user's account.
 * 
 * This function allows a user to delete their account, along with any associated files.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.deleteUserAccount = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('loginRequired2') });
    }

    const userId = req.session.passport.user;

    await File.deleteMany({ owner: userId });
    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: req.t('userNotFound') });
    }

    req.session.destroy();
    res.status(200).json({ message: req.t('userDeleted1') });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingUser') });
  }
};

/**
 * Delete a user by ID.
 * 
 * This function allows an admin to delete a user by their ID.
 * 
 * @param {object} req - The request object containing the user ID.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.deleteUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('loginRequired3') });
    }

    const userId = req.params.id;
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);

    if (currentUser.role !== 'admin') {
      return res.status(401).json({ message: req.t('notAuthorized') });
    }

    await File.deleteMany({ owner: userId });
    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: req.t('userNotFound') });
    }

    const sessions = await Session.find({ userId });
    sessions.forEach((session) => {
      session.destroy((err) => {
        if (err) console.error(err);
      });
    });

    res.status(200).json({ message: req.t('userDeleted') });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingUser') });
  }
};

/**
 * Delete all users.
 * 
 * This function allows an admin to delete all users from the system.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object to send the result.
 * @returns {void}
 */
exports.deleteAllUsers = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('loginRequired4') });
    }

    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);

    if (currentUser.role !== 'admin') {
      return res.status(401).json({ message: req.t('notAuthorized') });
    }

    await User.deleteMany();
    await Session.deleteMany();

    res.status(200).json({ message: req.t('allUsersDeleted') });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllUsers') });
  }
};
