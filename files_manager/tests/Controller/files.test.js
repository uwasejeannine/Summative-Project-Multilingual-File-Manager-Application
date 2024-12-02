/**
 * File controller module.
 * 
 * This module exports several functions for handling file uploads, retrieval, and deletion.
 */

const multer = require('multer');
const User = require('../model/user.test');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const File = require('../model/file.test');
const fileQueue = require('../../queue/fileQueue');

/**
 * Multer configuration.
 * 
 * This configuration sets up Multer to store uploaded files in the './uploads/' directory.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: async (req, file, cb) => {
    const filename = file.originalname;
    const extension = path.extname(filename);
    const basename = path.basename(filename, extension);

    // Check if a file with the same name exists
    const existingFile = await File.findOne({ filename: basename + extension });

    if (existingFile) {
      let counter = existingFile.counter || 1;
      let newFilename = `${basename}(${counter})${extension}`;

      while (await File.findOne({ filename: newFilename })) {
        counter++;
        newFilename = `${basename}(${counter})${extension}`;
      }

      req.uniqueName = newFilename;
      cb(null, newFilename);
    } else {
      req.uniqueName = filename;
      cb(null, filename);
    }
  }
});

const upload = multer({ storage });

/**
 * Upload a file.
 * 
 * Handles file uploads. Verifies that the user is logged in and the file is valid.
 * Saves the file to the database and associates it with the user.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.uploadFiles = async (req, res) => {
  try {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxFileSize = 1024 * 512; // 500KB

    // Handle file upload
    upload.array()(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: req.t('errorUploadingFile') });
      }

      // Check if the user is logged in
      if (!req.session.passport) {
        return res.status(401).json({ message: req.t('mustBeLoggedInToUploadFiles') });
      }

      const userId = req.session.passport.user;
      const file = req.files[0];

      // Validate file type and size
      if (!allowedFileTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: req.t('invalidFileType') });
      }

      if (file.size > maxFileSize) {
        return res.status(400).json({ message: req.t('fileSizeLimitExceeded') });
      }

      const fileDoc = new File({
        filename: req.uniqueName,
        filePath: file.path,
        size: file.size,
        contentType: file.mimetype,
        owner: userId,
        uploadDate: new Date(),
        lastAccessed: new Date(),
        lastModified: new Date(),
        fileStatus: 'active'
      });

      // Save the file to the database and update the user's files
      try {
        await fileDoc.save();
        await User.findByIdAndUpdate(userId, { $push: { files: fileDoc.filename } });

        return res.json({ message: req.t('UploadedSuccessfully') });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ message: req.t('errorSavingFileToDatabase') });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorUploadingFile') });
  }
};

/**
 * Get all files.
 * 
 * Retrieves all files from the database. Only admins can view all files.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.allFiles = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToViewAllFiles') });
    }

    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);

    if (currentUser.role === "admin") {
      const files = await File.find();
      await File.updateMany({}, { $set: { lastAccessed: new Date() } });

      if (!files.length) {
        return res.status(404).json({ message: req.t('noFilesUploaded') });
      }

      const encryptedFiles = await Promise.all(files.map(async (file) => {
        // Encrypt file path and owner
        const newFilePath = `${file.filePath}_${Date.now()}_${Math.random()}`;
        const filePathKey = crypto.randomBytes(32);
        const filePathIv = crypto.randomBytes(16);
        const filePathCipher = crypto.createCipheriv('aes-256-cbc', filePathKey, filePathIv);
        const encryptedFilePath = filePathCipher.update(newFilePath, 'utf8', 'hex');

        const ownerKey = crypto.randomBytes(32);
        const ownerIv = crypto.randomBytes(16);
        const ownerCipher = crypto.createCipheriv('aes-256-cbc', ownerKey, ownerIv);
        const encryptedOwner = ownerCipher.update(file.owner.toString(), 'utf8', 'hex');

        return {
          ...file.toObject(),
          filePath: {
            iv: filePathIv.toString('hex'),
            encryptedData: encryptedFilePath
          },
          owner: {
            iv: ownerIv.toString('hex'),
            encryptedData: encryptedOwner
          }
        };
      }));

      return res.status(200).json({ files: encryptedFiles });
    } else {
      return res.status(401).json({ message: req.t('notAuthorized') });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorGettingFiles') });
  }
};

/**
 * Delete a file.
 * 
 * Deletes a file by its ID. User must be logged in and have the proper permissions.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteFile = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDeleteFiles') });
    }

    const fileId = req.params.id;
    const userId = req.session.passport.user;

    // Check if the user owns the file
    const file = await File.findById(fileId);
    if (!file || file.owner.toString() !== userId) {
      return res.status(401).json({ message: req.t('notAuthorizedToDeleteFile') });
    }

    await File.deleteOne({ _id: fileId });
    await User.findByIdAndUpdate(userId, { $pull: { files: fileId } });

    return res.status(200).json({ message: req.t('fileDeletedSuccessfully') });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDeletingFile') });
  }
};

/**
 * Get user files.
 * 
 * Retrieves all files owned by the current user.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.userFiles = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToViewYourFiles') });
    }

    const userId = req.session.passport.user;
    const files = await File.find({ owner: userId });
    await File.updateMany({}, { $set: { lastAccessed: new Date() } });

    if (!files.length) {
      return res.status(404).json({ message: req.t('noFilesUploaded1') });
    }

    const encryptedFiles = await Promise.all(files.map(async (file) => {
      // Encrypt file path and owner
      const newFilePath = `${file.filePath}_${Date.now()}_${Math.random()}`;
      const filePathKey = crypto.randomBytes(32);
      const filePathIv = crypto.randomBytes(16);
      const filePathCipher = crypto.createCipheriv('aes-256-cbc', filePathKey, filePathIv);
      const encryptedFilePath = filePathCipher.update(newFilePath, 'utf8', 'hex');

      const ownerKey = crypto.randomBytes(32);
      const ownerIv = crypto.randomBytes(16);
      const ownerCipher = crypto.createCipheriv('aes-256-cbc', ownerKey, ownerIv);
      const encryptedOwner = ownerCipher.update(file.owner.toString(), 'utf8', 'hex');

      return {
        ...file.toObject(),
        filePath: {
          iv: filePathIv.toString('hex'),
          encryptedData: encryptedFilePath
        },
        owner: {
          iv: ownerIv.toString('hex'),
          encryptedData: encryptedOwner
        }
      };
    }));

    return res.status(200).json({ files: encryptedFiles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorGettingUserFiles') });
  }
};
