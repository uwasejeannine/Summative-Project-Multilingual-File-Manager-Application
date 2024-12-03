# MultiLingual File Manager App

[![License: ALU](https://img.shields.io/badge/License-ALU-yellow.svg)](https://opensource.org/licenses/ALU)

Welcome to the MultiLingual File Manager App, a web application designed to manage files in multiple languages. This app allows users to upload, download, and manage files in various languages, making it an ideal solution for individuals and organizations that work with multilingual content.

## Main Contributors

- [Brian Muli Muoki Eng](https://github.com/mulimuoki001)
- [Jeannine Uwase](https://github.com/uwasejeannine)


## Setup

To get started with the app, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/multilingual-file-manager.git`
2. Install dependencies: `npm install`
3. Create a new database: `createdb multilingual_file_manager`
4. Configure environment variables: `cp .env.example .env`
5. Start the app: `npm run start`

# Routes

The following routes were tested  using Postman:

## User Routes

These routes handle user-related operations.


### 1. Register a new user

* **POST** `/register`
* Handler: `usersController.createUser`

### 2. Login a user

* **POST** `/user/login`
* Handler: `usersController.loginUser`

### 3. Get user details by ID

* **GET** `/users/:id`
* Handler: `usersController.getUser`

### 4. Update my profile

* **PUT** `/myProfile`
* Handler: `usersController.updateUser`

### 5. Delete a user account

* **DELETE** `/deleteMyAccount`
* Handler: `usersController.deleteUserAccount`

### 6. Delete a user by ID

* **DELETE** `/deleteUser/:id`
* Handler: `usersController.deleteUser`

### 7. Get all users

* **GET** `/allusers`
* Handler: `usersController.getAllUsers`

### 8. Delete all users

* **DELETE** `/deleteAllUsers`
* Handler: `usersController.deleteAllUsers`

### 9. Logout a user

* **GET** `/logout`
* Handler: `usersController.logoutUser`

### 10. Update user password

* **POST** `/updateMyPassword`
* Handler: `usersController.updatePassword`


## File Routes

These routes handle file-related operations.


### 1. Upload a file

* **POST** `/upload`
* Handler: `filesController.uploadFile`

### 2. Get all files

* **GET** `/allFiles`
* Handler: `filesController.allFiles`

### 3. Get user files

* **GET** `/myfiles`
* Handler: `filesController.userFiles`

### 4. Get other user's files by ID

* **GET** `/otherUsersFiles/:id`
* Handler: `filesController.otherUsersFiles`

### 5. Update a file by ID

* **PUT** `/updateFile/:id`
* Handler: `filesController.updateFileName`

### 6. Delete a file by ID for any user

* **DELETE** `/deleteOtherUsersFiles/:id`
* Handler: `filesController.deleteFileByIdForAnyUser`

### 7. Delete a file by ID

* **DELETE** `/deleteFile/:id`
* Handler: `filesController.deleteFile`

### 8. Delete all files for all users

* **DELETE** `/deleteAllFiles`
* Handler: `filesController.deleteAllFiles`

### 9. Delete all my files

* **DELETE** `/deleteAllMyFiles`
* Handler: `filesController.DeleteAllMyFiles`

### 10. Delete all files for any user

* **DELETE** `/deleteAllFilesForAnyUser`
* Handler: `filesController.deleteAllFilesForAnyUser`

### 11. Download a file by ID

* **GET** `/download/:id`
* Handler: `filesController.downloadFile`


## Session Routes

These routes handle session-related operations.

### 1. Get all sessions

* **GET** `/getAllSessions`
* Handler: `sessionController.getAllSessions`

### 2. Get sessions by user ID

* **GET** `/getSessionByUserId/:id`
* Handler: `sessionController.getSessionByUserId`

### 3. Delete all sessions for a particular user

* **DELETE** `/deleteAllSessionsForAnyUser/:id`
* Handler: `sessionController.deleteAllSessionsForAnyUser`

### 4. Delete all sessions

* **DELETE** `/deleteAllSessions`
* Handler: `sessionController.deleteAllSessions`



## Language Routes

These routes handle language-related operations.


### 1. Create a new language

* **POST** `/languages`
* Handler: `languageController.createLanguage`

### 2. Update an existing language

* **PUT** `/languages/:id`
* Handler: `languageController.updateLanguage`

### 3. Delete a language

* **DELETE** `/languages/:id`
* Handler: `languageController.deleteLanguage`

### 4. Get all languages

* **GET** `/languages`
* Handler: `languageController.getAllLanguages`

### 5. Get a specific language by ID

* **GET** `/languages/:id`
* Handler: `languageController.getLanguage`



# Technical Details

## Backend Framework

* **Express.js**: A popular web framework for Node.js that allows us to build web applications and APIs.

## Database

* **MongoDB**: A NoSQL database that stores data in JSON-like documents. It is scalable and flexible, making it a good choice for applications that require flexible data models.
* **Mongoose**: An Object-Document Mapping (ODM) library that provides a simple way to interact with MongoDB from Node.js.

## Authentication

* **Passport.js**: A popular authentication middleware for Node.js that supports various authentication strategies, including Local Strategy (username and password authentication).

## File Upload

* **Multer**: A middleware for handling multipart/form-data, which is commonly used for file uploads.

## Internationalization

* **i18next**: A popular internationalization library that provides a simple way to handle translations in our application.
* **i18next-fs-backend**: A backend for i18next that stores translations in a file system.
* **i18next-http-middleware**: A middleware for i18next that provides a simple way to handle translations in our application.

## Session Management

* **Express-Session**: A session middleware for Express.js that provides a simple way to manage user sessions in our application.

## Cache and Message Broker

* **Redis**: An in-memory data structure store that can be used as a cache and message broker.

## Job Queueing

* **Bull**: A fast and reliable job queueing library for Node.js that provides a simple way to handle background jobs and tasks.

## Encryption

* **Crypto**: A built-in Node.js library that provides a simple way to perform cryptographic operations, such as encryption and decryption.

## Environment Variables

* **Dotenv**: A library that loads environment variables from a `.env` file into `process.env`.

## Password Hashing

* **Bcrypt**: A password hashing library that provides a simple way to hash passwords securely.



## Contributing

Contributions are welcome! If you'd like to contribute to the app, please fork the repository and submit a pull request.

## License

The app is licensed under the ALU License.