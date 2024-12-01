/**
 * Main router file.
 * 
 * This file sets up the routes for the application.
 */

const express = require('express');
const router = express.Router();

/**
 * Import controllers.
 * 
 * These controllers handle the business logic for each route.
 */
const filesController = require('../controllers/filescontroller');
const usersController = require('../controllers/userscontroller');
const sessionController = require('../controllers/sessionController');
const languageController = require('../controllers/languageController');



/**
 * User routes
 * 
 * These routes handle user-related operations.
 */
// Register a new user
router.post('/register', usersController.createUser);
// Login a user
router.post('/user/login', usersController.loginUser);
// Get user details by ID
router.get('/users/:id', usersController.getUser);
// Update my profile
router.put('/myProfile', usersController.updateUser);
// Delete a user account
router.delete('/deleteMyAccount', usersController.deleteUserAccount);
// Delete a user by ID
router.delete('/deleteUser/:id', usersController.deleteUser);
// Get all users
router.get('/allusers', usersController.getAllUsers);
// Delete all users
router.delete('/deleteAllUsers', usersController.deleteAllUsers);
// Logout a user
router.get('/logout', usersController.logoutUser);
// Update user password
router.post('/updateMyPassword', usersController.updatePassword);


/**
 * File routes
 * 
 * These routes handle file-related operations.
 */
// Upload a file
router.post('/upload', filesController.uploadFiles);
// Get all files
router.get('/allFiles', filesController.allFiles);
// Get user files
router.get('/myfiles', filesController.userFiles);
// Get other user's files by ID
router.get('/otherUsersFiles/:id', filesController.otherUsersFiles);
// Update a file by ID
router.put('/updateFile/:id', filesController.updateFileName);
// Delete a file by ID for any user
router.delete('/deleteOtherUsersFiles/:id', filesController.deleteFileByIdForAnyUser);
// Delete a file by ID
router.delete('/deleteFile/:id', filesController.deleteFile);
// Delete all files for all users
router.delete('/deleteAllFiles', filesController.deleteAllFiles);
//Delete all my files
router.delete('/deleteAllMyFiles', filesController.DeleteAllMyFiles);
// Delete all files for any user
router.delete('/deleteAllFilesForAnyUser', filesController.deleteAllFilesForAnyUser);
// Download a file by ID
router.get('/download/:id', filesController.downloadFile);



/**
 * Session routes
*/
// Route to get all sessions
router.get('/getAllSessions', sessionController.getAllSessions);
// Route to get sessions by user ID. All sessions for a particular user
router.get('/getSessionByUserId/:id', sessionController.getSessionByUserId);
//Route to delete all sessions for a particular user
router.delete('/deleteAllSessionsForAnyUser/:id', sessionController.deleteAllSessionsForAnyUser);
// Route to delete all sessions
router.delete('/deleteAllSessions', sessionController.deleteAllSessions);




/**
 * Language routes
*/
// Route to create a new language
router.post('/languages', languageController.createLanguage);
// Route to update an existing language
router.put('/languages/:id', languageController.updateLanguage);
// Route to delete a language
router.delete('/languages/:id', languageController.deleteLanguage);
// Route to get all languages
router.get('/languages', languageController.getAllLanguages);
// Route to get a specific language by ID
router.get('/languages/:id', languageController.getLanguage);



// Export the router
module.exports = router;