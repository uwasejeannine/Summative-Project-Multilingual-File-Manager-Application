const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGODB_URL;

let dbConnection;

module.exports = {

  connectToDb: (cb) => {
    mongoose.connect(url)
      .then(() => {
        dbConnection = mongoose.connection;
        return cb(); // Return callback function without invoking it.
      })
      .catch(err => {
        console.log(err);
        return cb(err); // Return callback function with error invoked.
      });
  },

  getDb: () => dbConnection
};