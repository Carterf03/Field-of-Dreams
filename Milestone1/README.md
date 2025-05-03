# Team Project: Milestone 1

## Field of Dreams

## Progress Report

### Completed Features

- Completed home page
- Completed sign up pages (frontend)
- Completed my plays page (frontend)
- Completed user settings pages (frontend)

### Pending Features

- User authentication
- User tracking between pages
- Creating/Editing an animation
- Viewing an animation
- Dynamically generated coach codes
- Storing plays in a database

### Page Implementation Progress

<!-- Provide links to wireframes of pages not 100% completed -->

| Page                   | Status | Wireframe                               |
| ---------------------- | ------ | --------------------------------------- |
| Home                   | ✅     |
| Sign Up (Coach)        | ✅     |
| Sign Up (Player)       | ✅     |
| My Plays (Coach)       | ✅     |
| My Plays (Player)      | ✅     |
| User Settings (Coach)  | ✅     |
| User Settings (Player) | ✅     |
| View Animation         | 0%     | [wireframe](../Proposal/playerview.png) |
| Edit Animation         | 0%     | [wireframe](../Proposal/coachview.png)  |

## API Documentation

| Method   | Route                  | Description                                                |
| -------- | ---------------------- | ---------------------------------------------------------- |
| `POST`   | `/login`               | Receives an email and password                             |
| `POST`   | `/logout`              | Log out the current user                                   |
| `POST`   | `/register`            | Creates a new user account and returns the new user object |
| `GET`    | `/users`               | Retrieves an array of all active users in the system       |
| `GET`    | `/users/:userId`       | Retrieves a user by its Id                                 |
| `GET`    | `/users/:userId/plays` | Get all plays made by a specific user                      |
| `PUT`    | `/users/:userId`       | Updates a user by its Id                                   |
| `DELETE` | `/users/:userId`       | Delete a specific user                                     |
| `POST`   | `/plays`               | Creates a new play and returns the new user object         |
| `GET`    | `/plays`               | Retrieves an array of all plays in the system              |
| `GET`    | `/plays/:playId`       | Retrieves a play by its Id                                 |
| `PUT`    | `/plays/:playId`       | Updates a play by its Id                                   |
| `DELETE` | `/plays/:playId`       | Delete a specific play                                     |

## Team Member Contributions

#### Bree Cobb

- Created myplays.html
- Created plays.json and users.json
- Created FOD logo
- Created styles.css and plays.css
- Created playsSubtitle.js

#### Carter Fultz

- Created coachSettings.html, playerSettings.html, and addCoach.html
- Created addcoach.css and settings.css
- Created APIRoutes.js
- Created app.js

#### Isaac Palmer

- Created home.html, playerSignUp.html, and coachSignUp.html
- Created home.css and signUp.css

#### Milestone Effort Contribution

<!-- Must add to 100% -->

| Bree Cobb | Carter Fultz | Isaac Palmer |
| --------- | ------------ | ------------ |
| 33%       | 33%          | 33%          |
