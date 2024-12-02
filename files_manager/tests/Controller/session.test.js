/**
 * Session controller module.
 * 
 * This module exports several functions for handling session data.
 */

const Session = require('../model/session.test');
const User = require('../model/user.test');

/**
 * Utility function to check if the user is logged in and has the correct role.
 * 
 * @param {object} req - The request object.
 * @param {string} requiredRole - The role that is required to proceed.
 * @returns {object} - The user object if authorized, or an error response.
 */
const checkAuthorization = async (req, requiredRole) => {
  if (!req.session.passport) {
    return { status: 401, message: req.t('mustBeLoggedIn') };
  }

  const currentUserId = req.session.passport.user;
  const currentUser = await User.findById(currentUserId);

  if (currentUser.role !== requiredRole) {
    return { status: 401, message: req.t('notAuthorized') };
  }

  return { status: 200, user: currentUser };
};

/**
 * Get all sessions.
 * 
 * This function retrieves all sessions from the database. Only admins can access all sessions.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getAllSessions = async (req, res) => {
  try {
    const authorization = await checkAuthorization(req, 'admin');
    if (authorization.status !== 200) {
      return res.status(authorization.status).json({ message: authorization.message });
    }

    const sessions = await Session.find();
    res.setHeader('X-Total-Count', sessions.length);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingSessions') });
  }
};

/**
 * Get session by user ID.
 * 
 * This function retrieves sessions by a specific user ID. Only admins can view sessions for other users.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getSessionByUserId = async (req, res) => {
  try {
    const authorization = await checkAuthorization(req, 'admin');
    if (authorization.status !== 200) {
      return res.status(authorization.status).json({ message: authorization.message });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: req.t('userNotFound') });
    }

    const sessions = await Session.find({ user: userId });

    if (sessions.length === 0) {
      return res.status(404).json({ message: req.t('noSessionsFoundForThisUser') });
    }

    res.setHeader('X-Total-Count', sessions.length);
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingThisUsersSessions') });
  }
};

/**
 * Delete all sessions for a specific user.
 * 
 * This function deletes all sessions for a given user. Only admins can perform this action.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteAllSessionsForAnyUser = async (req, res) => {
  try {
    const authorization = await checkAuthorization(req, 'admin');
    if (authorization.status !== 200) {
      return res.status(authorization.status).json({ message: authorization.message });
    }

    const userId = req.params.id;
    const result = await Session.deleteMany({ user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: req.t('noSessionsFoundForThisUser') });
    }

    res.status(200).json({ message: req.t('allOtherUsersSessionsDeletedSuccessfully') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllThisUsersSessions') });
  }
};

/**
 * Delete all sessions.
 * 
 * This function deletes all sessions from the database. Only admins can perform this action.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteAllSessions = async (req, res) => {
  try {
    const authorization = await checkAuthorization(req, 'admin');
    if (authorization.status !== 200) {
      return res.status(authorization.status).json({ message: authorization.message });
    }

    await Session.deleteMany();
    req.session.destroy();

    res.status(200).json({ message: req.t('allSessionsDeletedSuccessfully') });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllSessions') });
  }
};
