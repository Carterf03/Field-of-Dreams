const express = require('express');
const router = express.Router();

const playsDB = require('./db/plays.json');
const usersDB = require('./db/users.json');

// Login
router.post('/login', (req, res) => {

});

// Logout
router.post('/logout', (req, res) => {

});

// Register
router.post('/register', (req, res) => {

});

// Get all users
router.get('/users', (req, res) => {

});

// Get user with user ID
router.get('/users/:userId', (req, res) => {

});

// Get all plays for a specific user
router.get('/users/:userId/plays', (req, res) => {

});

// Updated preexisting user
router.put('/users', (req, res) => {

});

// Delete user
router.delete('/users/:userId', (req, res) => {

});

// Get all plays
router.get('/plays', (req, res) => {

});

// Get play with ID
router.get('/plays/:playId', (req, res) => {

});

// Delete play
router.delete('/plays/:playId', (req, res) => {

});

// Create a new play
router.post('/plays', (req, res) => {

});

// Updated preexisting play
router.put('/plays/:playId', (req, res) => {

});

module.exports = router;