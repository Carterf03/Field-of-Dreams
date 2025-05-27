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
    playElement.dataset.playId = play.id;

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

    // Dropdown logic for this play element only
    const toggleBtn = playInstance.querySelector('.dropdown-toggle');
    const menu = playInstance.querySelector('.dropdown-menu');

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        menu.classList.remove('show');
    });

    /** Update Play Title Modal Functionality **/
    const renameModelButton = playInstance.querySelector('.rename-btn');
    const playTitleModal = document.querySelector('#playTitleModal');
    const cancelButtons = document.querySelectorAll('#cancel');

    // Show the modal when Rename is clicked
    renameModelButton.addEventListener('click', (e) => {
        const playElement = e.target.closest('.play');
        const playId = playElement.dataset.playId;
        console.log('Rename clicked for play ID:', playId);

        // Show modal and store the playId for submission
        playTitleModal.classList.remove('hidden');
        playTitleModal.dataset.playId = playId;
    });


    /** Delete Play Modal Functionality **/
    const deletePlayModal = document.querySelector('#deletePlayModal');
    const deleteModalButton = playInstance.querySelector('.delete-btn');

    deleteModalButton.addEventListener('click', (e) => {
        const playElement = e.target.closest('.play');
        const playId = playElement.dataset.playId;
        // console.log('Delete clicked for play ID:', playId);

        // Show modal and store the playId for submission
        deletePlayModal.classList.remove('hidden');
        deletePlayModal.dataset.playId = playId;
    });

    /** Delete Play Functionality **/
    const deleteForm = document.querySelector('#deleteForm');
    deleteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        api.deletePlay(deletePlayModal.dataset.playId).then(() => {
            deletePlayModal.classList.add('hidden');
        });
    });


    cancelButtons.forEach(e => {
        e.addEventListener('click', () => {
            playTitleModal.classList.add('hidden');
            deletePlayModal.classList.add('hidden');
        });
    });

    return playElement;
}