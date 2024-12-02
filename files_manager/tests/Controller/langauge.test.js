const Language = require('../model/Language.test');

/**
 * Utility function to handle common error responses.
 * 
 * @param {object} res - The response object.
 * @param {number} statusCode - The HTTP status code.
 * @param {string} message - The message to send in the response.
 * @returns {void}
 */
const sendErrorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({ message });
};

/**
 * Create a new language.
 * 
 * This function creates a new language if it doesn't already exist.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.createLanguage = async (req, res) => {
  const { name, displayName } = req.body;
  const createdBy = req.user ? req.user.username : 'Unknown';

  try {
    const existingLanguage = await Language.findOne({ name });
    if (existingLanguage) {
      return sendErrorResponse(res, 400, 'Language already exists');
    }

    const newLanguage = new Language({
      name,
      displayName,
      createdBy
    });

    await newLanguage.save();
    res.status(201).json({ message: 'Language created successfully', language: newLanguage });
  } catch (err) {
    console.error(err);
    sendErrorResponse(res, 500, 'Error creating language');
  }
};

/**
 * Edit a language.
 * 
 * This function updates an existing language.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.updateLanguage = async (req, res) => {
  const { id } = req.params;
  const { name, displayName } = req.body;

  try {
    const language = await Language.findById(id);
    if (!language) {
      return sendErrorResponse(res, 404, 'Language not found');
    }

    language.name = name || language.name;
    language.displayName = displayName || language.displayName;

    await language.save();
    res.json({ message: 'Language updated successfully', language });
  } catch (err) {
    console.error(err);
    sendErrorResponse(res, 500, 'Error updating language');
  }
};

/**
 * Delete a language.
 * 
 * This function deletes a language by its ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteLanguage = async (req, res) => {
  const { id } = req.params;

  try {
    const language = await Language.findByIdAndDelete(id);
    if (!language) {
      return sendErrorResponse(res, 404, 'Language not found');
    }
    res.json({ message: 'Language deleted successfully' });
  } catch (err) {
    console.error(err);
    sendErrorResponse(res, 500, 'Error deleting language');
  }
};

/**
 * Get all languages.
 * 
 * This function retrieves all languages from the database.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.find();
    res.json(languages);
  } catch (err) {
    console.error(err);
    sendErrorResponse(res, 500, 'Error retrieving languages');
  }
};

/**
 * Get a specific language.
 * 
 * This function retrieves a language by its ID.
 * 
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getLanguage = async (req, res) => {
  const { id } = req.params;

  try {
    const language = await Language.findById(id);
    if (!language) {
      return sendErrorResponse(res, 404, 'Language not found');
    }
    res.json(language);
  } catch (err) {
    console.error(err);
    sendErrorResponse(res, 500, 'Error retrieving language');
  }
};
