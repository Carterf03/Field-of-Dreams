import api from './APIClient.js';

const email = document.querySelector('#email');
const password = document.querySelector('#password');

const loginForm = document.querySelector('#loginForm')
loginForm.addEventListener('submit', e => {
    e.preventDefault();

    api.logIn(email.value, password.value).then(user => {
        document.location = './myplays';
    }).catch(err => {
        console.log("Invalid username or password");
        showError(err);
        email.value = "";
        password.value = "";
    })
});

// Displays any login errors (Incorrect username/password)
const errorBox = document.querySelector('#errorbox');
function showError(error) {
  errorBox.classList.remove("hidden");
  if(error.status === 401) {
    errorBox.textContent = "Invalid username or password";
  }
  else {
    errorBox.textContent = error;
  }
}