/**
 * File model module.
 * 
 * Defines the File model using Mongoose.
 * Exports the File model.
 */

const mongoose = require("mongoose");

/**
 * File schema definition.
 * 
 * Defines the structure of the File document in the database.
 */
const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    unique: true
  },
  contentType: String,
  size: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: Date,
  filePath: String,
  downloadCount: Number,
  lastAccessed: Date,
  lastModified: Date,
  fileStatus: String
});

/**
 * File model.
 * 
 * Mongoose model for the File document.
 */
const File = mongoose.model('File', fileSchema);

module.exports = File;
module.exports = {};