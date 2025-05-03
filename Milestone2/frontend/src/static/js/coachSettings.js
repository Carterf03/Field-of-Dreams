import api from './APIClient.js';

// const user = api.getCurrentUser();

// document.addEventListener("DOMContentLoaded", function () {
//     user.then(function (data) {
//         if (data) {
//             populateCoach(data);
//         } else {
//             console.error("Failed to retrieve user data.");
//         }
//     }).catch(function (error) {
//         console.error("Error fetching user data:", error);
//     });
// });

api.getCurrentUser().then(user => {
    populateCoach(user);
});

function populateCoach(user) {
    const username = document.getElementById("name");
    const email = document.getElementById("email");
    const code = document.getElementById("coachcode");
    const role = document.getElementById("userrole");
    const avatar = document.getElementById("previewImage");

    username.innerHTML = user.full_name;
    email.innerHTML = user.email;
    code.innerHTML = user.coach_code;
    role.innerHTML = "Coach";
    if (user.avatar) {
        avatar.src = user.avatar;
    } else {
        avatar.src = '/images/fakepfp.png';
    }
}


// TODO: Change Password Functionality
const changePasswordButton = document.querySelector('#changepassword');
changePasswordButton.addEventListener('click', e => {
    
});

// TODO: Logout Functionality
const logoutButton = document.querySelector('#logout');
logoutButton.addEventListener('click', e => {
    api.logOut().then(() => {
        document.location = "./";
    });
});

// TODO: Delete Account Functionality
const deleteAccountButton = document.querySelector('#delete');
deleteAccountButton.addEventListener('click', e => {
    
});