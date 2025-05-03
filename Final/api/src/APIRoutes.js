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
    const prefix = file.fieldname === 'preview' ? 'play-' : 'avatar-';
    cb(null, prefix + uniqueSuffix + extname);
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
const FrameDAO = require('./db/FrameDAO');
const ObjectDAO = require('./db/ObjectDAO');
const User = require('./db/models/Player');


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
apiRouter.put('/players/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    const salt = crypto.randomBytes(16).toString('hex'); //Generate a new random salt
    crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) { //problem computing digest, like hash function not available
            res.status(500).json({error: "Error hashing password " + err});
        }
        
        const digest = derivedKey.toString('hex');
        const user = {
            fullName: req.body.fullName,
            email: req.body.email,
            avatar: req.body.avatar,
            salt: salt,
            password: digest
        }

        UserDAO.updatePlayer(userId, user).then(() => {
            res.json({success: true});
        }).catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
    });
});

// Follow a Coach
apiRouter.post('/players/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    if (req.body.coachCode) {
        UserDAO.getCoachByCode(req.body.coachCode).then(coach => {
            UserDAO.followCoach(userId, coach.id).then(() => {
                res.json(coach);
            }).catch(err => {
                res.status(err.code || 500).json({error: err.message});
            });
        }).catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
    } else {
        res.status(400).json({error: 'Coach Code not provided'});
    }
});

// Delete Player
apiRouter.delete('/players/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.deletePlayer(userId).then(() => {
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
apiRouter.put('/coaches/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    const salt = crypto.randomBytes(16).toString('hex'); //Generate a new random salt
    crypto.pbkdf2(req.body.password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) { //problem computing digest, like hash function not available
            res.status(500).json({error: "Error hashing password " + err});
        }
        
        const digest = derivedKey.toString('hex');
        const user = {
            fullName: req.body.fullName,
            email: req.body.email,
            avatar: req.body.avatar,
            salt: salt,
            password: digest
        }

        UserDAO.updateCoach(userId, user).then(() => {
            res.json({success: true});
        }).catch(err => {
            res.status(err.code || 500).json({error: err.message});
        });
    });
});

// Delete Coach
apiRouter.delete('/coaches/:userId', TokenMiddleware, (req, res) => {
    const userId = req.params.userId;
    UserDAO.deleteCoach(userId).then(() => {
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

// Get frames for a specific play
apiRouter.get('/plays/:playId/frames', TokenMiddleware, (req, res) => {
    const playId = req.params.playId;
    FrameDAO.getFramesByPlayId(playId).then(frames => {
        res.json(frames);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Create a new play
apiRouter.post('/plays', TokenMiddleware, (req, res) => {
    const play = {
        playTitle: req.body.playTitle,
        playPreview: req.body.playPreview
    };
    PlayDAO.createNewPlay(req.user.id, play).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Updated preexisting play
apiRouter.put('/plays/:playId', TokenMiddleware, (req, res) => {
    const play = {
        play_id: req.params.playId,
        play_title: req.body.playTitle,
        play_preview: req.body.playPreview
    };
    PlayDAO.updatePlay(play).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
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

/* FRAME ROUTES */

// Get a frame with ID
apiRouter.get('/frames/:frameId', TokenMiddleware, (req, res) => {
    const frameId = req.params.frameId;
    FrameDAO.getFrameByFrameId(frameId).then(frame => {
        res.json({frame: frame});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Get all objects in a frame
apiRouter.get('/frames/:frameId/objects', TokenMiddleware, (req, res) => {
    const frameId = req.params.frameId;
    ObjectDAO.getObjectsByFrameId(frameId).then(objects => {
        res.json(objects);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Create a new frame
apiRouter.post('/frames', TokenMiddleware, (req, res) => {
    const newFrame = {
        ball_x: req.body.ball_x,
        ball_y: req.body.ball_y,
    };
    FrameDAO.createNewFrame(newFrame).then(frame => {
        res.json(frame);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Update a frame
apiRouter.put('/frames/:frameId', TokenMiddleware, (req, res) => {
    const frame = {
        frame_id: req.params.frameId,
        ball_x: req.body.ball_x,
        ball_y: req.body.ball_y
    };
    FrameDAO.updateFrame(frame).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Delete a frame
apiRouter.delete('/frames/:frameId', TokenMiddleware, (req, res) => {
    const frameId = req.params.frameId;
    FrameDAO.deleteFrame(frameId).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

/* OBJECT ROUTES */

// Get the moves of a specific object with player id between frames
apiRouter.get('/objects/:playerId', TokenMiddleware, (req, res) => {
    const playerId = req.params.playerId;
    ObjectDAO.getObjectsByPLayerId(playerId).then(objectMoves => {
        res.json(objectMoves);
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Create a new object
apiRouter.post('/objects', TokenMiddleware, (req, res) => {
    const object = {
        player_id: req.body.playerId,
        object_x: req.body.objectX,
        object_y: req.body.objectY,
        object_color: req.body.objectColor,
    };
    ObjectDAO.createNewObject(req.body.frameId, object).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Update an object
apiRouter.put('/objects/:objectId', TokenMiddleware, (req, res) => {
    console.log("HERE ----------------------- req.body", req.body);
    const object = {
        object_id: req.body.objectId,
        player_id: req.body.playerId,
        object_x: req.body.objectX,
        object_y: req.body.objectY,
        object_color: req.body.objectColor,
    };
    ObjectDAO.updateObject(object).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Delete an object
apiRouter.delete('/objects/:objectId', TokenMiddleware, (req, res) => {
    const objectId = req.params.objectId;
    ObjectDAO.deleteObject(objectId).then(() => {
        res.json({success: true});
    }).catch(err => {
        res.status(err.code || 500).json({error: err.message});
    });
});

// Save a preview image for a play
apiRouter.post('/preview', upload.single('preview'), (req, res) => {
    if (req.file) {
      // Create URL path to the saved image
      const previewUrl = `/uploads/${req.file.filename}`;
      res.status(201).json({ 
        success: true,
        previewUrl: previewUrl 
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: 'Preview image not provided' 
      });
    }
  });

// Save an avatar image for a user
apiRouter.post('/avatar', upload.single('avatar'), (req, res) => {
    if (req.file && req.body.userId) {
        const avatarUrl = `/uploads/${req.file.filename}`;
        const userId = req.body.userId;
        const user = UserDAO.getPlayerById(userId).then(user => {
            UserDAO.updatePlayer(user.fullName, user.email, avatarUrl, user.salt, user.password).then(() => {
                res.json({ success: true });
            }).catch(err => {
                res.status(err.code || 500).json({ error: err.message });
            });
        }).catch(err => {
            UserDAO.getCoachById(userId).then(user => {
                UserDAO.updateCoach(user.fullName, user.email, avatarUrl, user.coachCode, user.salt, user.password).then(() => {
                    res.json({ success: true });
                }).catch(err => {
                    res.status(err.code || 500).json({ error: err.message });
                });
            }
            ).catch(err => {
                res.status(err.code || 500).json({ error: err.message });
            });
        });
        res.status(201).json({ avatarUrl: avatarUrl });
    } else {
        res.status(400).json({ error: 'Avatar image not provided' });
    }
});

module.exports = apiRouter;