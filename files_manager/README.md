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

## Routes

The app has the following routes:

# User Routes

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


# File Routes

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


# Session Routes

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



# Language Routes

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
## API Documentation

T
## Contributing

Contributions are welcome! If you'd like to contribute to the app, please fork the repository and submit a pull request.

## License

The app is licensed under the MIT License.