/**
 * File controller module.
 * 
 * This module exports several functions for handling file uploads, retrieval, and deletion.
 */

const multer = require('multer');
const mongoose = require('mongoose');
const User = require('../models/user');

/**
 * Multer configuration.
 * 
 * This configuration sets up Multer to store uploaded files in the './uploads/' directory.
 */
const upload = multer({ dest: './uploads/' });

const File = require('../models/files');

/**
 * Upload a file.
 * 
 * This function handles file uploads. It checks if the user is logged in and if a file is provided.
 * If the file is uploaded successfully, it saves the file to the database and adds it to the user's files.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.uploadFile = async (req, res) => {
  try {
    upload.any()(req, res, async (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading file' });
      } else {
        if (!req.session.passport) {
          res.status(401).json({ message: 'You must be logged in to upload files' });
          return;
        }
        const userId = req.session.passport.user;
        console.log(userId);

        if (req.files && req.files.length > 0) {
          const file = req.files[0];
          const fileDoc = new File({
            name: file.originalname,
            path: file.path,
            size: file.size,
            type: file.mimetype,
            userId: userId,
            owner: userId
          });
          try {
            await fileDoc.save();
            await User.findByIdAndUpdate(userId, { $push: { files: fileDoc._id } });
            res.json({ message: 'File uploaded successfully' });
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error saving file to database' });
          }
        } else {
          res.status(400).json({ message: 'No file uploaded' });
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading file' });
  }
}

/**
 * Get all files.
 * 
 * This function retrieves all files from the database.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.allFiles = async (req, res) => {
  try {
    const files = await File.find();
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting files' });
  }
}

/**
 * Get user files.
 * 
 * This function retrieves all files owned by the current user.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.userFiles = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: 'You must be logged in to view your files' });
      return;
    } else {
      const userId = req.session.passport.user;
      const files = await File.find({ owner: userId });
      res.json(files);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting user files' });
  }
}

/**
 * Delete a file.
 * 
 * This function deletes a file by its ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteFile = async (req, res) => {
  try {
    if (!req.session.passport) {
      res.status(401).json({ message: 'You must be logged in to delete files' });
      return;
    }
    const userId = req.session.passport.user;
    const fileId = req.params.id;
    const result = await File.deleteOne({ _id: fileId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'File not found' });
      return;
    } else if (result.deletedCount === 1) {
      await User.findByIdAndUpdate(userId, { $pull: { files: fileId } });
      res.status(200).json({ message: 'File deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting file' });
  }
}

/**
 * Delete all files.
 * 
 * This function deletes all files from the database.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteAllFiles = async (req, res) => {
  try {
    const count = await File.countDocuments();
    if (count === 0) {
      res.status(404).json({ message: 'No files found' });
    } else {
      await File.deleteMany();
      await User.updateMany({}, { $set: { files: [] } });
      res.status(200).json({ message: 'All files deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting all files' });
  }
}