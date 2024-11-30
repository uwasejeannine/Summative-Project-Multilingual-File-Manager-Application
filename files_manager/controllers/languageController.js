const Language = require('../models/Language');

// Create a new language
exports.createLanguage = async (req, res) => {
  const { name, displayName } = req.body;
  const createdBy = req.user ? req.user.username : 'Unknown'; // Assuming you have a user object in the request

  try {
    const existingLanguage = await Language.findOne({ name });
    if (existingLanguage) {
      return res.status(400).json({ message: 'Language already exists' });
    }

    const newLanguage = new Language({
      name,
      displayName,
      createdBy // Store the username of the user who created the language
    });

    await newLanguage.save();
    res.status(201).json({ message: 'Language created successfully', language: newLanguage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating language' });
  }
};

// Edit a language
exports.updateLanguage = async (req, res) => {
  const { id } = req.params;
  const { name, displayName } = req.body;

  try {
    const language = await Language.findById(id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }

    language.name = name || language.name;
    language.displayName = displayName || language.displayName;

    await language.save();
    res.json({ message: 'Language updated successfully', language });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating language' });
  }
};

// Delete a language
exports.deleteLanguage = async (req, res) => {
  const { id } = req.params;

  try {
    const language = await Language.findByIdAndDelete(id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    res.json({ message: 'Language deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting language' });
  }
};

// Get all languages
exports.getAllLanguages = async (req, res) => {
  try {
    const languages = await Language.find();
    res.json(languages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving languages' });
  }
};

// Get a specific language
exports.getLanguage = async (req, res) => {
  const { id } = req.params;

  try {
    const language = await Language.findById(id);
    if (!language) {
      return res.status(404).json({ message: 'Language not found' });
    }
    res.json(language);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving language' });
  }
    
    
};
