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

/**
 * User routes.
 * 
 * These routes handle user-related functionality.
 */

/**
 * Get session route.
 * 
 * This route retrieves the current session.
 * 
 * @route GET /getsession
 */
router.get('/getsession', usersController.getSession);

/**
 * Register user route.
 * 
 * This route creates a new user.
 * 
 * @route POST /register
 */
router.post('/register', usersController.createUser);

/**
 * Login user route.
 * 
 * This route logs in an existing user.
 * 
 * @route POST /user/login
 */
router.post('/user/login', usersController.loginUser);

/**
 * Get user route.
 * 
 * This route retrieves a user by ID.
 * 
 * @route GET /users/:id
 */
router.get('/users/:id', usersController.getUser);

/**
 * Update user route.
 * 
 * This route updates an existing user.
 * 
 * @route PUT /users/:id
 */
router.put('/users/:id', usersController.updateUser);

/**
 * Delete user route.
 * 
 * This route deletes a user.
 * 
 * @route DELETE /deleteUser
 */
router.delete('/deleteUser', usersController.deleteUser);

/**
 * Get all users route.
 * 
 * This route retrieves all users.
 * 
 * @route GET /allusers
 */
router.get('/allusers', usersController.getAllUsers);

/**
 * Delete all users route.
 * 
 * This route deletes all users.
 * 
 * @route DELETE /deleteAllUsers
 */
router.delete('/deleteAllUsers', usersController.deleteAllUsers);

/**
 * Logout user route.
 * 
 * This route logs out the current user.
 * 
 * @route GET /logout
 */
router.get('/logout', usersController.logoutUser);

/**
 * File routes.
 * 
 * These routes handle file-related functionality.
 */

/**
 * Upload file route.
 * 
 * This route uploads a new file.
 * 
 * @route POST /upload
 */
router.post('/upload', filesController.uploadFile);

/**
 * Get all files route.
 * 
 * This route retrieves all files.
 * 
 * @route GET /allFiles
 */
router.get('/allFiles', filesController.allFiles);

/**
 * Get user files route.
 * 
 * This route retrieves files for the current user.
 * 
 * @route GET /userFiles
 */
router.get('/userFiles', filesController.userFiles);

/**
 * Delete file route.
 * 
 * This route deletes a file by ID.
 * 
 * @route DELETE /deleteFile/:id
 */
router.delete('/deleteFile/:id', filesController.deleteFile);

/**
 * Delete all files route.
 * 
 * This route deletes all files.
 * 
 * @route DELETE /deleteAllFiles
 */
router.delete('/deleteAllFiles', filesController.deleteAllFiles);

/**
 * Session routes.
 * 
 * These routes handle session-related functionality.
 */

/**
 * Get all sessions route.
 * 
 * This route retrieves all sessions.
 * 
 * @route GET /getAllSessions
 */
router.get('/getAllSessions', sessionController.getAllSessions);

/**
 * Get session by user ID route.
 * 
 * This route retrieves a session by user ID.
 * 
 * @route GET /getSessionByUserId/:id
 */
router.get('/getSessionByUserId/:id', sessionController.getSessionByUserId);

/**
 * Export the router.
 * 
 * This allows other parts of the application to use the router.
 */
module.exports = router;