/**
 * Database connection module.
 * 
 * This module is responsible for establishing a connection to the MongoDB database.
 * It exports two functions: `connectToDb` and `getDb`.
 */

const mongoose = require("mongoose");
require("dotenv").config();

/**
 * MongoDB connection URL.
 * 
 * This URL is used to connect to the MongoDB database.
 * It is stored in an environment variable for security reasons.
 */
const url = process.env.MONGODB_URL;

/**
 * Database connection object.
 * 
 * This object is used to store the connection to the MongoDB database.
 * It is initialized when the `connectToDb` function is called.
 */
let dbConnection;

/**
 * Connect to the MongoDB database.
 * 
 * This function establishes a connection to the MongoDB database using the provided URL.
 * It uses the `mongoose.connect` function to connect to the database.
 * 
 * @param {function} cb - Callback function to be invoked when the connection is established or an error occurs.
 * @returns {void}
 */
module.exports = {
  connectToDb: (cb) => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, dbName: "multilingualFilesManager",retryWrites: true, w: "majority" })
      .then(() => {
        dbConnection = mongoose.connection;
        console.log("Successfully connected to MongoDB.");
        cb(); // Invoke callback function with no arguments
      })
      .catch(err => {
        console.log(err);
        cb(err); // Invoke callback function with error as argument
      });
  },

  /**
   * Get the database connection object.
   * 
   * This function returns the database connection object.
   * It can be used to access the database connection after it has been established.
   * 
   * @returns {object} Database connection object.
   */
  getDb: () => dbConnection
};