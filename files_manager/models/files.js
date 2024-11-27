/**
 * File model module.
 * 
 * This module defines the File model using Mongoose.
 * It exports the File model.
 */

const mongoose = require("mongoose");

/**
 * File schema definition.
 * 
 * This schema defines the structure of the File document in the database.
 * It includes fields for filename, content type, size, owner, upload date, and file data.
 */
const fileSchema = new mongoose.Schema({
  /**
   * Filename.
   * 
   * The name of the file.
   */
  filename: String,

  /**
   * Content type.
   * 
   * The MIME type of the file.
   */
  contentType: String,

  /**
   * Size.
   * 
   * The size of the file in bytes.
   */
  size: Number,

  /**
   * Owner.
   * 
   * The user who uploaded the file, referenced by their ID.
   */
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  /**
   * Upload date.
   * 
   * The date and time when the file was uploaded.
   */
  uploadDate: Date,

  /**
   * File data.
   * 
   * The contents of the file, stored as a binary buffer.
   */
  fileData: Buffer
});

/**
 * File model.
 * 
 * This is the Mongoose model for the File document.
 */
const File = mongoose.model('File', fileSchema);

/**
 * Export the File model.
 */
module.exports = File;