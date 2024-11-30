const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    translations: { type: Object, required: false },  // translations field
  displayName: { type: String, required: true },
  createdBy: { Date: String }
});

module.exports = mongoose.model('Language', languageSchema);
