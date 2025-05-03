import api from './APIClient.js';

// Check if user is logged in
api.getCurrentUser().then(user => {
    // Nothing
}).catch(error => {
    console.log(error.status);
    if(error.status === 401) {
        console.log("We are not logged in");
        document.location = './';
    } else {
      console.log(`${error.status}`, error);
    }
});