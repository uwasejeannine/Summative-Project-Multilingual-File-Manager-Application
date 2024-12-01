/**
 * Session controller module.
 * 
 * This module exports several functions for handling session data.
 */

const Session = require('../models/session');
const User = require('../models/user');

/**
 * Get all sessions.
 * 
 * This function retrieves all sessions from the database.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getAllSessions = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('mustBeLoggedInToViewSessions') });
      return;
    }
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role === 'admin') {
      const sessions = await Session.find();

      res.setHeader('X-Total-Count', sessions.length);
      res.json(sessions);
    } else {
      res.status(401).json({ message: req.t('notAuthorizedToViewSessions') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingSessions') });
  }
};

/**
 * Get session by user ID.
 * 
 * This function retrieves a session by its user ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getSessionByUserId = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('mustBeLoggedInToViewThisUsersSessions') });
      return;
    }
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (currentUser.role === 'admin') {
      
      
      if (!user) {
        res.status(404).json({ message:req.t('userNotFound') });
      }else{
        const sessions = await Session.find({ user: userId });
        if (sessions.length === 0) {
          res.status(404).json({ message: req.t('noSessionsFoundForThisUser') });
        } else {
          res.setHeader('X-Total-Count', sessions.length);
          res.json(sessions);
        }
      }
    } else {
      res.status(401).json({ message: req.t('notAuthorizedToViewThisUsersSessions') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorGettingThisUsersSessions') });
  }
};

exports.deleteAllSessionsForAnyUser = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('mustBeLoggedInToDeleteAllOtherUsersSessions') });
      return;
    }
    const userId = req.params.id;
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role === 'admin') {
      const result = await Session.deleteMany({ userId: userId });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: req.t('noSessionsFoundForThisUser') });
      } else {
        res.status(200).json({ message: req.t('allOtherUsersSessionsDeletedSuccessfully') });
      }
      
    } else {
      res.status(401).json({ message: req.t('notAuthorizedToDeleteAllOtherUsersSessions') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllThisUsersSessions') });
  }
}
/**
 * Delete all sessions.
 * 
 * This function deletes all sessions from the database. You must be logged in as an admin to delete all sessions.
 *
 */
exports.deleteAllSessions = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: req.t('mustBeLoggedInToDeleteAllSessions') });
      return;
    }
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role === 'admin') {
      await Session.deleteMany();
      req.session.destroy();

      res.status(200).json({ message: req.t('allSessionsDeletedSuccessfully') });
    } else {
      res.status(401).json({ message: req.t('notAuthorizedToDeleteAllSessions') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingAllSessions') });
  }
};

