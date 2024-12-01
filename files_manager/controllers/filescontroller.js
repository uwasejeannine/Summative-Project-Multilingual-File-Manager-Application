/**
 * File controller module.
 * 
 * This module exports several functions for handling file uploads, retrieval, and deletion.
 */

const multer = require('multer');
const User = require('../models/user');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const File = require('../models/files');
const fileQueue = require('../queue/fileQueue');

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

    const existingFile = await File.findOne({ filename: basename + extension });

    if (existingFile) {
      let counter = existingFile.counter || 1;
      let newFilename = `${basename}(${counter})${extension}`;

      while (true) {
        const newFile = await File.findOne({ filename: newFilename });
        if (!newFile) {
          req.uniqueName = newFilename;
          cb(null, newFilename);
          break;
        }
        counter++;
        newFilename = `${basename}(${counter})${extension}`;
      }
    } else {
      req.uniqueName = filename;
      cb(null, filename);
    }
  }
});

const upload = multer({ storage: storage });
const encryptionKey = crypto.randomBytes(32).toString('base64');

/**
 * Upload a file.
 * 
 * Handles file uploads. Checks if the user is logged in and if a file is provided.
 * If the file is uploaded successfully, it saves the file to the database and adds it to the user's files.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.uploadFile = async (req, res) => {
  try {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxFileSize = 1024 * 512; // 500KB

    upload.any()(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message:  req.t('errorUploadingFile') });
      }

      if (!req.session.passport) {
        return res.status(401).json({ message: req.t('mustBeLoggedInToUploadFiles') });
      }

      const userId = req.session.passport.user;
      const file = req.files[0];

      if (!allowedFileTypes.includes(file.mimetype)) {
        return res.status(400).json({ message: req.t('invalidFileType') });
      }

      if (file.size > maxFileSize) {
        return res.status(400).json({ message: req.t('fileSizeLimitExceeded') });
      }

      if (req.files && req.files.length > 0) {
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

        try {
          await fileDoc.save();
          await User.findByIdAndUpdate(userId, { $push: { files: fileDoc.filename} });
          return res.json({ message: req.t('fileUploadedSuccessfully') });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ message: req.t('errorSavingFileToDatabase') });
        }
      } else {
        return res.status(400).json({ message: req.t('noFileUploaded') });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500)
      .json({ message: req.t('errorUploadingFile') });
  }
}


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

      if (files.length === 0) {
        return res.status(404).json({ message: req.t('noFilesUploaded') });
      }

      const encryptedFiles = await Promise.all(files.map(async file => {
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
      res.status(401).json({ message: req.t('mustBeLoggedInToDeleteFiles') });
      return;
    }
    const userId = req.session.passport.user;
    const fileId = req.params.id;
    const result = await File.deleteOne({ _id: fileId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: req.t('fileNotFound') });
      return;
    } else if (result.deletedCount === 1) {
      await User.findByIdAndUpdate(userId, { $pull: { files: fileId } });
      res.status(200).json({ message: req.t('fileDeletedSuccessfully') });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: req.t('errorDeletingFile') });
  }
}


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
      return res.status(401).json({ message:req.t('mustBeLoggedInToViewYourFiles') });
    }

    const userId = req.session.passport.user;
    const files = await File.find({ owner: userId });
    await File.updateMany({}, { $set: { lastAccessed: new Date() } });

    if (files.length === 0) {
      return res.status(404).json({ message:  req.t('noFilesUploaded1') });
    }

    const encryptedFiles = await Promise.all(files.map(async file => {
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
    return res.status(500).json({ message: req.t('errorGettingYourFiles') });
  }
}

/**
 * Get other user's files.
 * 
 * Retrieves all files owned by a specific user.
 * Only admins can view other users' files.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.otherUsersFiles = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToViewOtherUsersFiles') });
    }

    // Get current user and user ID
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    const userId = req.params.id;

    // Check if current user is admin
    if (currentUser.role === "admin") {
      // Get files owned by user
      const files = await File.find({ owner: userId });

      // Check if files exist
      if (files.length === 0) {
        return res.status(404).json({ message: req.t('noFilesUploaded2') });
      }

      // Encrypt files
      const encryptedFiles = await Promise.all(files.map(async file => {
        // Generate new file path
        const newFilePath = `${file.filePath}_${Date.now()}_${Math.random()}`;

        // Encrypt file path and owner
        const filePathKey = crypto.randomBytes(32);
        const filePathIv = crypto.randomBytes(16);
        const filePathCipher = crypto.createCipheriv('aes-256-cbc', filePathKey, filePathIv);
        const encryptedFilePath = filePathCipher.update(newFilePath, 'utf8', 'hex');

        const ownerKey = crypto.randomBytes(32);
        const ownerIv = crypto.randomBytes(16);
        const ownerCipher = crypto.createCipheriv('aes-256-cbc', ownerKey, ownerIv);
        const encryptedOwner = ownerCipher.update(file.owner.toString(), 'utf8', 'hex');

        // Return encrypted file
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

      // Return encrypted files
      return res.status(200).json({ files: encryptedFiles });
    } else {
      // Return error if user is not admin
      return res.status(401).json({ message: req.t('notAuthorized') });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorGettingOtherUsersFiles') });
  }
}


/**
 * Delete a file.
 * 
 * Deletes a file by its ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteFile = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDeleteYourFiles') });
    }

    // Get file ID and user ID
    const fileId = req.params.id;
    const userId = req.session.passport.user;

    // Get files owned by user
    const currentUserFiles = await File.find({ owner: userId });

    // Check if file exists and user is authorized
    if (currentUserFiles.some(file => file._id.toString() === fileId)) {
      // Delete file
      const result = await File.deleteOne({ _id: fileId });

      // Check if file was deleted
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: req.t('fileNotFound') });
      } else if (result.deletedCount === 1) {
        // Update user files
        const result = await User.findByIdAndUpdate(userId, { $pull: { files: fileId } });
        return res.status(200).json({ message: req.t('fileDeletedSuccessfully') });
      }
    } else {
      return res.status(401).json({ message: req.t('notAuthorized') });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDeletingFile') });
  }
}

/**
 * Deletes a file by its ID for any user.
 * 
 * This function deletes a file by its ID. The user must be logged in and must be an admin to execute this function.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteFileByIdForAnyUser = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDeleteFile') });
    }

    // Get file ID
    const fileId = req.params.id;
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    if (currentUser.role === "admin") {
      // Delete file
      const result = await File.deleteOne({ _id: fileId });
      // Check if file was deleted
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: req.t('fileNotFound') });
      } else if (result.deletedCount === 1) {
        // Update user files
        const userId = req.session.passport.user;
        await User.findByIdAndUpdate(userId, { $pull: { files: fileId } });
        return res.status(200).json({ message: req.t('fileDeletedSuccessfully') });
      }
    }else{
      return res.status(401).json({ message: req.t('notAuthorizedToDeleteFile') });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDeletingFile') });
  }
};



/**
 * Deletes all files from the database.
 * 
 * This function deletes all files from the database. The user must be logged in and be an admin.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteAllFiles = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDeleteAllFiles') });
    }

    // Get current user
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);

    // Check if user is admin
    if (currentUser.role !== "admin") {
      return res.status(401).json({ message: req.t('notAuthorizedToDeleteAllFiles') });
    }

    // Delete all files
    await File.deleteMany();

    // Update user files
    await User.updateMany({}, { $set: { files: [] } });

    return res.status(200).json({ message: req.t('allFilesDeletedSuccessfully') });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDeletingAllFiles') });
  }
};


/**
 * Downloads a file.
 * 
 * This function downloads a file. The user must be logged in and be the owner of the file or an admin.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.downloadFile = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDownloadFile') });
    }

    // Get current user and file ID
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);
    const fileId = req.params.id;

    // Get file
    const file = await File.findById(fileId);

    // Check if file exists
    if (!file) {
      return res.status(404).json({ message: req.t('fileNotFound') });
    }

    // Check if user is owner or admin
    if (file.owner.toString() !== currentUserId && currentUser.role !== 'admin') {
      return res.status(401).json({ message: req.t('notAuthorizedToDownloadFile') });
    }

    // Set headers and pipe file to response
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    fs.createReadStream(file.filePath).pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDownloadingFile') });
  }
};


/**
 *delete all my files
 */
exports.DeleteAllMyFiles = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDeleteAllYourFiles') });
    }

    // Get current user
    const currentUserId = req.session.passport.user;
    // Delete all files owned by user
    await File.deleteMany({ owner: currentUserId });

    // Update user files
    await User.findByIdAndUpdate(currentUserId, { $set: { files: [] } });

    return res.status(200).json({ message: req.t('allYourFilesDeletedSuccessfully') });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDeletingAllYourFiles') });
  }
};




/**
 * delete all files for any user
 *You must be logged in and an admin
 */
exports.deleteAllFilesForAnyUser = async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToDeleteAllOtherUsersFiles') });
    }

    // Get current user
    const currentUserId = req.session.passport.user;
    const currentUser = await User.findById(currentUserId);

    // Check if user is admin
    if (currentUser.role !== "admin") {
      return res.status(401).json({ message: req.t('notAuthorizedToDeleteAllOtherUsersFiles') });
    }

    // Delete all files
    await File.deleteMany();

    // Update user files
    await User.updateMany({}, { $set: { files: [] } });

    return res.status(200).json({ message: req.t('allOtherUsersFilesDeletedSuccessfully') });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorDeletingAllThisUsersFiles') });
  }
};


exports.uploadFile1 = async (req, res) => {
  const { filename } = req.body;

  try {
    const job = await fileQueue.add({ filename }); // Add task to queue
    res.status(201).json({ message: 'File upload queued', jobId: job.id });
  } catch (err) {
    console.error('Error queuing file upload:', err);
    res.status(500).json({ message: 'Error queuing file upload' });
  }
};


/**
 * Update the name of a file.
*/

exports.updateFileName = async (req, res) => {
  try {
    if (!req.session.passport) {
      return res.status(401).json({ message: req.t('mustBeLoggedInToUpdateFileName') });
    }
    const userId = req.session.passport.user;
    const fileId = req.params.id;
    const { fileName } = req.body;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: req.t('fileNotFound') });
    }
    if (file.owner.toString() !== userId) {
      return res.status(401).json({ message: req.t('notAuthorizedToUpdateFileName') });
    }
    const filenames = await File.find({ owner: userId, filename: fileName });
    if (filenames.length > 0) {
      return res.status(409).json({ message: req.t('filenameAlreadyExists') });
    }else{
      file.filename = fileName;
      await file.save();
      return res.status(200).json({ message: req.t('fileNameUpdatedSuccessfully') });
    }
    // Rest of your code
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: req.t('errorUpdatingFileName') });
  }
}