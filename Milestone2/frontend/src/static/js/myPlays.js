import api from './APIClient.js';

const playList = document.getElementById('plays');

const nav2 = document.querySelector('#nav2');
const nav3 = document.querySelector('#nav3');

// Get Current User
api.getCurrentUser().then(user => {
    let userId = null;
    if (!user) {
        console.error('No user logged in');
        return;
    } else if (user.coach_code) {
        // Update Navigation to be Coach specific
        nav2.textContent = "Create A Play";
        nav2.href = ""; //TODO
        nav3.href = "./coachsettings";

        // Populate the users plays
        populatePlays(user);
    } else {
        // Update Navigation to be Player specific
        nav2.textContent = "Add a Coach";
        nav2.href = "./addcoach";
        nav3.href = "./playersettings";

        // TODO: Populate the users plays
        api.getPlayerCoaches(user.id).then(coaches => {
            coaches.forEach(coach => {
                populatePlays(coach);
            });
        }).catch(err => {
            console.error('Error fetching coaches:', err);
        });
    }
});

// Populate the users plays
function populatePlays(coach) {
    api.getCoachPlays(coach.id).then(plays => {
        plays.forEach(play => {
            const playElement = makePlay(play, coach.full_name);
            playList.appendChild(playElement);
        });
    }).catch(err => {
        console.error('Error fetching plays:', err);
    });
}

// Function used for creating the Play HTML from the template
const coachTemplate = document.querySelector('#playTemplate');
function makePlay(play, fullName) {
    const playInstance = coachTemplate.content.cloneNode(true);
    const playElement = playInstance.querySelector('.play');

    const playPreview = playInstance.querySelector('.playpreview');
    playPreview.src = play.preview;

    const playName = playInstance.querySelector('.playname');
    playName.textContent = play.title;

    const coachName = playInstance.querySelector('.coachname');
    coachName.textContent = fullName;

    return playElement;
}