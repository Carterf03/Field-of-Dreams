# Final Team Project

## Field of Dreams

## Progress Report

### Completed Features

- Delete Account Functionality
- Change Password Functionality
- View Animation
- Create Animation
  - Adding/Deleting Players to Animation
  - Adding/Deleting Frames
  - Drag + Drop Functionality
- Login/Logout Functionality
- Player/Coach Registeration Functionality
- Player/Coach information displayed in settings
- Player's Coaches displayed on the addcoach page
- Displaying User Plays on the /myplays page

### Known Issues & Limitations

- No Dynamically Generated Preview Pictures

## Authentication & Authorization

For the animations, there is a two-stage check in place to ensure that players cannot create or modify animations. Since all of the animation logic is contained within one file, the code first checks whether a user is on the /viewplay or /createplay page. If it finds a user on the createplay page, it verifies the user's coach code to ensure that they are a coach. If not, the user is redirected to the /viewplay page.

## PWA Capabilities

<!-- Describe features available to your users offline, caching strategy, installability, theming, etc. -->

## API Documentation

| Method   | Route                      | Description                                                  |
| -------- | -------------------------- | ------------------------------------------------------------ |
| `POST`   | `/users/login`             | Receives an email and password                               |
| `POST`   | `/users/logout`            | Log out the current user                                     |
| `GET`    | `/users/current`           | Get current user logged in                                   |
| `POST`   | `/players`                 | Creates a new Player account and returns the new user object |
| `GET`    | `/players/:userId`         | Retrieves a Player by its Id                                 |
| `GET`    | `/players/:userId/plays`   | Get all plays that can be accessed by a specific Player      |
| `GET`    | `/players/:userId/coaches` | Get all Coaches a specific Player is linked to               |
| `PUT`    | `/players/:userId`         | Updates a Player by its Id                                   |
| `DELETE` | `/players/:userId`         | Delete a specific Player                                     |
| `POST`   | `/coaches`                 | Creates a new Coach account and returns the new user object  |
| `GET`    | `/coaches/:userId`         | Retrieves a Coach by its Id                                  |
| `GET`    | `/coaches/:userId/plays`   | Get all plays that are created by a specific Coach           |
| `PUT`    | `/coaches/:userId`         | Updates a Coach by its Id                                    |
| `DELETE` | `/coaches/:userId`         | Delete a specific Coach                                      |
| `POST`   | `/plays`                   | Creates a new play and returns the new play object           |
| `GET`    | `/plays/:playId`           | Retrieves a play by its Id                                   |
| `GET`    | `/plays/:playId/frames`    | Retrieves all the frames in a play                           |
| `PUT`    | `/plays/:playId`           | Updates a play by its Id                                     |
| `DELETE` | `/plays/:playId`           | Delete a specific play                                       |
| `POST`   | `/frames`                  | Creates a new frame                                          |
| `GET`    | `/frames/:frameId`         | Retrieves a frame by its Id                                  |
| `GET`    | `/frames/:frameId/objects` | Retrieves all the objects in a frame                         |
| `PUT`    | `/frames/:frameId`         | Updates a frame by its Id                                    |
| `DELETE` | `/frames/:frameId`         | Delete a specific frame                                      |
| `POST`   | `/objects`                 | Creates a new object                                         |
| `GET`    | `/objects/:objectId`       | Retrieves an object by its Id                                |
| `PUT`    | `/objects/:objectId`       | Updates an object by its Id                                  |
| `DELETE` | `/objects/:objectId`       | Delete a specific object                                     |

## Database ER Diagram

```markdown
Use this syntax to embed an image in your markdown file:

![](images/erd.png)
```

## Team Member Contributions

#### Bree Cobb

- Viewing Animation Functionality
- Creating Animation Functionality
- Account Verification in Animations

#### Carter Fultz

- Delete Account Functionality
- Change Password Functionality
- Login/Signup Page and Navigation UI Updated
- Service Worker/Offline Functionality
- Installable App Functionality

#### Isaac Palmer

- Delete Account Functionality
- Play API Routes
- Frame API Routes
- Object API Routes

#### Milestone Effort Contribution

<!-- Must add to 100% -->

| Team Member 1 | Team Member 2 | Team Member 3 |
| ------------- | ------------- | ------------- |
| 33%            | 33%            | 33%            |
