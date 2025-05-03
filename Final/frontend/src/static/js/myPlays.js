import api from './APIClient.js';

const playList = document.getElementById('plays');
const nav2 = document.querySelector('#nav2');
const nav3 = document.querySelector('#nav3');

let isCoach = false;

// Get Current User
api.getCurrentUser().then(user => {
    if (!user) {
        console.error('No user logged in');
        return;
    }
    
    // Determine if user is a coach and store the result
    isCoach = !!user.coach_code;
    
    if (isCoach) {
        nav2.textContent = "Create A Play";
        nav2.href = "./createplay";
        nav3.href = "./coachsettings";
        
        populatePlays(user);
    } else {
        nav2.textContent = "Add a Coach";
        nav2.href = "./addcoach";
        nav3.href = "./playersettings";
        
        // Populate plays from all coaches the player follows
        api.getPlayerCoaches(user.id).then(coaches => {
            coaches.forEach(coach => {
                populatePlays(coach);
            });
        }).catch(err => {
            console.error('Error fetching coaches:', err);
        });
    }
}).catch(err => {
    console.error('Error fetching current user:', err);
});

// Populate the user's plays
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

    const playLink = playInstance.querySelector('.play a');
    
    // Set the link based on whether the user is a coach or player
    if (isCoach) {
        playLink.href = `/createplay?playId=${play.id}`;
    } else {
        playLink.href = `/viewplay?playId=${play.id}`;
    }

    const playPreview = playInstance.querySelector('.playpreview');
    playPreview.src = play.preview;

    const playName = playInstance.querySelector('.playname');
    playName.textContent = play.title;

    const coachName = playInstance.querySelector('.coachname');
    coachName.textContent = fullName;

    return playElement;
}