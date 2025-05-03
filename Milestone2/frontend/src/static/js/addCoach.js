import api from './APIClient.js'

const welcome = document.querySelector('#welcome');

api.getCurrentUser().then(user => {
    welcome.textContent = "Welcome, " + user.full_name;
    populateCoachList(user.id);
})

function populateCoachList(userId) {
    const coachesList = document.querySelector('#coachesList');
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


// TODO: Add Coach Functionality
const coachCodeInput = document.querySelector('#coachCode');
const coachCodeButton = document.querySelector('#submit');
coachCodeButton.addEventListener('click', e => {
    
});