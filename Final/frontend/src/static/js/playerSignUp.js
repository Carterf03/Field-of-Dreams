import api from './APIClient.js';

const fullName = document.querySelector('#fullName');
const email = document.querySelector('#email');
const password = document.querySelector('#password');

// Player Signup EventListener
const signupForm = document.querySelector('#signupForm')
signupForm.addEventListener('submit', e => {
    e.preventDefault();

    api.registerPlayer(fullName.value, email.value, password.value).then(user => {
        document.location = './myplays';
    }).catch(err => {
        console.log(err);
        if(error.status === 409) {
            console.log("Account already exists");
        }
    })
});