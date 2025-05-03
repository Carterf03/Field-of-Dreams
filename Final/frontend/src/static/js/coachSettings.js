import api from './APIClient.js';

api.getCurrentUser().then(user => {
    populateCoach(user);

    // Change Password Functionality
    const passwordForm = document.querySelector('#passwordForm');
    const newPassword = document.querySelector('#password');
    passwordForm.addEventListener('submit', e => {
        e.preventDefault();

        api.updateCoach(user.id, user.full_name, user.email, newPassword.value).then(() => {
            passwordModal.classList.add('hidden');
        }).catch(err => {
            console.log("Error Updating Password: ", err);
        });
    });

    // Delete Account Functionality
    const deleteAccountButton = document.querySelector('#delete');
    deleteAccountButton.addEventListener('click', e => {
        const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmed) {
            api.deleteCoach(user.id).then(() => {
                document.location = "./";
            }).catch(err => {
                console.log("Error Deleting Coach: ", err);
            });
        }
    });
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

// Logout Functionality
const logoutButton = document.querySelector('#logout');
logoutButton.addEventListener('click', e => {
    api.logOut().then(() => {
        document.location = "./";
    });
});


// Change Password Modal Functionality
const changePasswordButton = document.querySelector('#changepassword');
const passwordModal = document.querySelector('#passwordModal');
const cancelButton = document.querySelector('#cancel');

// Show the modal when delete is clicked
changePasswordButton.addEventListener('click', () => {
    passwordModal.classList.remove('hidden');
});

// Cancel button closes modal
cancelButton.addEventListener('click', () => {
    passwordModal.classList.add('hidden');
});