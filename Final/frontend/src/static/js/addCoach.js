import api from './APIClient.js'

const welcome = document.querySelector('#welcome');

api.getCurrentUser().then(user => {
    welcome.textContent = "Welcome, " + user.full_name;
    populateCoachList(user.id);
    linkCoach(user.id);
})

const coachesList = document.querySelector('#coachesList');
function populateCoachList(userId) {
    api.getPlayerCoaches(userId).then(coaches => {
        coaches.forEach(coach => {
            const coachHTML = createCoachHTML(coach);
            coachesList.append(coachHTML);
        });
    });
}

// Function used for creating the Coach HTML from the template
const coachTemplate = document.querySelector('#coachTemplate');
function createCoachHTML(coach) {
    const coachInstance = coachTemplate.content.cloneNode(true);

    // Set Users full name
    const coachName = coachInstance.querySelector('p#coachname');
    coachName.textContent = coach.full_name;
  
    return coachName;
}


// Add Coach Functionality
const coachCodeInput = document.querySelector('#coachCode');
const coachCodeForm = document.querySelector('#codeContainer');
function linkCoach(userId) {
    coachCodeForm.addEventListener('submit', e => {
        e.preventDefault();

        api.followCoach(userId, coachCodeInput.value).then(coach => {
            const coachHTML = createCoachHTML(coach);
            coachesList.append(coachHTML);
            coachCodeInput.value = "";
        }).catch(err => {
            console.log(err);
            showError(err);
        });
    });
}


// Displays any login errors (Incorrect coach)
const errorBox = document.querySelector('#errorbox');
function showError(error) {
    errorBox.classList.remove("hidden");
    if(error.status === 500) {
        errorBox.textContent = "Invalid Coach Code";
    } else if (error.status === 400) {
        errorBox.textContent = "Coach Code not provided";
    } else if (error.status === 409) {
        errorBox.textContent = "You are already followed to this Coach";
    } else {
        errorBox.textContent = error;
    }
}