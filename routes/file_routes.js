const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const User = require('../models/user');

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Registering new user...');
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: `User with username "${username}"  or email "${email}" already exists` });
    }
    const user = await User.create({ username, email, password });
    console.log('User created:', user);
    res.send({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Error registering user:', err);
    res.status(400).send({ message: 'Error registering user', error: err.message });
  }
});

// Login route
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
  res.send({ message: 'User logged in successfully' });
});

// Logout route
router.get('/logout', (req, res, next) => {
  const { username, email, password } = req.body;
  if (req.isAuthenticated()) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.send({ message: 'User logged out successfully' });
      res.redirect('/login');
    });
  } else {
    res.send({ message: 'User not logged in. Already logged out' });
  }

});

// Get all users route
router.get('/users', (req, res) => {
  User.find().then(users => {
    res.send(users);
  }).catch(err => {
    res.status(500).send({ message: 'Error fetching users' });
  });
});

// Get user by ID route
router.get('/users/:id', (req, res) => {
  User.findById(req.params.id).then(user => {
    if (!user) {
      res.status(404).send({ message: 'User not found' });
    } else {
      res.send(user);
    }
  }).catch(err => {
    res.status(500).send({ message: 'Error fetching user' });
  });
});

module.exports = router;