import api from './APIClient.js'

// Displaying User Avatar in the Navigation
const userAvatar = document.querySelector('img.pfp');
api.getCurrentUser().then(user => {
    if (user.avatar) {
        userAvatar.src = user.avatar;
    } else {
        userAvatar.src = '/images/fakepfp.png';
    }
});