const express = require('express');
const path = require('path');

const app = express();

// Designate the static folder as serving static resources
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));


const templatesPath = path.join(__dirname, 'templates');

// Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(templatesPath, 'home.html'));
});

// Player and Coach Sign Up
app.get('/playersignup', (req, res) => {
    res.sendFile(path.join(templatesPath, 'playerSignUp.html'));
});
app.get('/coachsignup', (req, res) => {
    res.sendFile(path.join(templatesPath, 'coachSignUp.html'));
});

// Player and Coach Plays Page
app.get('/myplays', (req, res) => {
    res.sendFile(path.join(templatesPath, 'myplays.html'));
});

// Player Pages
app.get('/addcoach', (req, res) => {
    res.sendFile(path.join(templatesPath, 'addCoach.html'));
});
app.get('/playersettings', (req, res) => {
    res.sendFile(path.join(templatesPath, 'playerSettings.html'));
});

app.get('/viewplay', (req, res) => {
    res.sendFile(path.join(templatesPath, 'animation.html'));
});

// Coach Pages
app.get('/createplay', (req, res) => {
    res.sendFile(path.join(templatesPath, 'createAnimation.html'));
});
app.get('/coachsettings', (req, res) => {
    res.sendFile(path.join(templatesPath, 'coachSettings.html'));
});

// Offline Page
app.get('/offline', (req,  res) => {
    res.sendFile(path.join(templatesPath, 'offline.html'));
});

const PORT = process.env.PORT;

// As our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));