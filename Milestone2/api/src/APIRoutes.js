const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../static/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + extname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2
  }
});

const apiRouter = express.Router();

apiRouter.use(cookieParser());
apiRouter.use(express.json());

const { generateToken, removeToken, TokenMiddleware } = require('./middleware/TokenMiddleware');

const UserDAO = require('./db/UserDAO');
const PlayDAO = require('./db/PlayDAO');


/* USER ROUTES */

// Login
apiRouter.post('/users/login', (req, res) => {
    if(req.body.email && req.body.password) {
        // Check for a Player with the same email and password
        UserDAO.getPlayerByCredentials(req.body.email, req.body.password).then(user => {
            generateToken(req, res, user);
            res.json({user: user});
        }).catch(() => {
            // If it does not find a Player with that email and password, check for a Coach
            UserDAO.getCoachByCredentials(req.body.email, req.body.password).then(user => {
                generateToken(req, res, user);
                res.json({user: user});
            }).catch(err => {
                console.log(err);
                res.status(401).json({error: err.message});
            });
        });
    } else {
        res.status(400).json({error: 'Credentials not provided'});
    }
});

// Logout
apiRouter.post('/users/logout', (req, res) => {
    removeToken(req, res);
    res.json({success: true});
});

// Get current user
apiRouter.get('/users/current', TokenMiddleware, (req,  res) => {
    res.json(req.user);
});


/* PLAYER ROUTES */

// Register a new player
apiRouter.post('/players', (req, res) => {
    if(req.body.fullName && req.body.email && req.body.password) {
        UserDAO.getPlayerByCredentials(req.body.email, req.body.password).then(user => {
            res.status(409).json({error: 'User already exists'});
        }).catch((reject) => {
            const salt = crypto.randomBytes(16).toString('hex'); //Generate a random salt
            //Hash password with salt
            crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) { //problem computing digest, like hash function not available
                    res.status(500).json({error: "Error hashing password " + err});
                }
        
                const digest = derivedKey.toString('hex');
                const newUser = {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    avatar: null,
                    salt: salt,
                    password: digest
                }
                UserDAO.registerPlayer(newUser).then(user => {
                    generateToken(req, res, user);
                    res.json({user: user});
                });
            });
        });
    } else {
        res.status(400).json({error: 'Credentials not provided'});
    }
});

// Get Player with user ID
apiRouter.get('/players/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.getPlayerById(userId).then(user => {
        res.json({user: user});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Get all plays for a specific Player
apiRouter.get('/players/:userId/plays', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    PlayDAO.getPlayerPlays(userId).then(plays => {
        res.json(plays);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Get all coaches a specific Player is followed to
apiRouter.get('/players/:userId/coaches', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.getCoachesByPlayerId(userId).then(coaches => {
        res.json(coaches);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Updated preexisting Player
apiRouter.put('/players', TokenMiddleware, (req, res) => {
    const userId = req.body.userId;
    const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        avatar: req.body.avatar
    };
    UserDAO.updateUser(userId, user).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Delete Player
apiRouter.delete('/players/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.deleteUser(userId).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});


/* COACH ROUTES */

// Register a new Coach
apiRouter.post('/coaches', (req, res) => {
    if(req.body.fullName && req.body.email && req.body.password) {
        UserDAO.getCoachByCredentials(req.body.email, req.body.password).then(user => {
            res.status(409).json({error: 'User already exists'});
        }).catch((reject) => {
            const salt = crypto.randomBytes(16).toString('hex'); //Generate a random salt
            //Hash password with salt
            crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err) { //problem computing digest, like hash function not available
                    res.status(500).json({error: "Error hashing password " + err});
                }
        
                const digest = derivedKey.toString('hex');
                const newUser = {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    avatar: null,
                    coachCode: crypto.randomBytes(3).toString('hex'),
                    salt: salt,
                    password: digest
                }
                UserDAO.registerCoach(newUser).then(user => {
                    generateToken(req, res, user);
                    res.json({user: user});
                });
            });
        });
    } else {
        res.status(400).json({error: 'Credentials not provided'});
    }
});

// Get Coach with user ID
apiRouter.get('/coaches/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.getCoachById(userId).then(user => {
        res.json({user: user});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Get all plays for a specific Coach
apiRouter.get('/coaches/:userId/plays', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    PlayDAO.getCoachPlays(userId).then(plays => {
        res.json(plays);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Updated preexisting Coach
apiRouter.put('/coaches', TokenMiddleware, (req, res) => {
    const userId = req.body.userId;
    const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        avatar: req.body.avatar
    };
    UserDAO.updateUser(userId, user).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Delete Coach
apiRouter.delete('/coaches/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.deleteUser(userId).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});


/* PLAY ROUTES */

// Get play with ID
apiRouter.get('/plays/:playId', TokenMiddleware, (req, res) => {
    const playId = req.params.playId;
    PlayDAO.getPlayByPlayId(playId).then(play => {
        res.json({play: play});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Create a new play
apiRouter.post('/plays', TokenMiddleware, (req, res) => {
    res.status(501).json({error: "Not Implemented"}); // TODO
});

// Updated preexisting play
apiRouter.put('/plays/:playId', TokenMiddleware, (req, res) => {
    res.status(501).json({error: "Not Implemented"}); // TODO
});

// Delete play
apiRouter.delete('/plays/:playId', TokenMiddleware, (req, res) => {
    const playId = req.params.playId;
    PlayDAO.deletePlay(playId).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});


apiRouter.post('/upload', upload.single('avatar'), (req, res) => {
    if(req.body.username && req.body.password && req.file) {
      const avatarUrl = `/uploads/${req.file.filename}`;
      console.log("APIRoutes avatarUrl: " + avatarUrl);
      UserDAO.createUser(req.body.firstName, req.body.lastName, req.body.username, req.body.password, avatarUrl)
        .then(user => {
          const filteredUser = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            avatar: user.avatar
          };
          res.status(201).json({user: filteredUser});
        })
        .catch(error => {
          res.status(error.code || 500).json({error: error.message || 'Internal server error'});
        });
    } else {
      res.status(400).json({error: 'Required fields not provided'});
    }
  });

module.exports = apiRouter;