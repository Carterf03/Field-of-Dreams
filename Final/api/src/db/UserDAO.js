const db = require('./DBConnection');

const Player = require('./models/Player');
const Coach = require('./models/Coach');


module.exports = {

    getPlayerByCredentials: (email, password) => {
        return db.query('SELECT * FROM player WHERE player_email=?', [email]).then(rows => {
            if (rows.length === 1) { // we found our user
                const player = new Player(rows[0]);
                return player.validatePassword(password);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    getPlayerById: (id) => {
        return db.query('SELECT * FROM player WHERE player_id=?', [id]).then(rows => {
            if (rows.length === 1) { // we found our user
                return new Player(rows[0]);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    registerPlayer: (userData) => {
        return db.query('INSERT INTO player (player_full_name, player_email, player_avatar, player_salt, player_password) VALUES (?, ?, ?, ?, ?)', 
                        [userData.fullName, userData.email, userData.avatar, userData.salt, userData.password]).then(result => {
            if(result.affectedRows === 1) {
                return module.exports.getPlayerById(result.insertId);
            }
            throw new Error('Player could not be created');
        });
    },

    updatePlayer: (id, user) => {
        return db.query('UPDATE player SET player_full_name=?, player_email=?, player_avatar=?, player_salt=?, player_password=? WHERE player_id=?', [user.fullName, user.email, user.avatar, user.salt, user.password, id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows updated, no such player
                throw new Error("No such user");
            }
            return true; // update successful
        });
    },

    deletePlayer: (id) => {
        return db.query('DELETE FROM player WHERE player_id=?', [id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows deleted, no such player
                throw new Error("No such user");
            }
            return true; // deletion successful
        });
    },

    getCoachByCredentials: (email, password) => {
        return db.query('SELECT * FROM coach WHERE coach_email=?', [email]).then(rows => {
            if (rows.length === 1) { // we found our user
                const coach = new Coach(rows[0]);
                return coach.validatePassword(password);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    getCoachById: (id) => {
        return db.query('SELECT * FROM coach WHERE coach_id=?', [id]).then(rows => {
            if (rows.length === 1) { // we found our user
                return new Coach(rows[0]);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    getCoachByCode: (coachCode) => {
        return db.query('SELECT * FROM coach WHERE coach_code=?', [coachCode]).then(rows => {
            if (rows.length === 1) { // we found our user
                return new Coach(rows[0]);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    registerCoach: (userData) => {
        return db.query('INSERT INTO coach (coach_full_name, coach_email, coach_avatar, coach_code, coach_salt, coach_password) VALUES (?, ?, ?, ?, ?, ?)', 
                        [userData.fullName, userData.email, userData.avatar, userData.coachCode, userData.salt, userData.password]).then(result => {
            if(result.affectedRows === 1) {
                return module.exports.getCoachById(result.insertId);
            }
            throw new Error('Coach could not be created');
        });
    },

    updateCoach: (id, user) => {
        return db.query('UPDATE coach SET coach_full_name=?, coach_email=?, coach_avatar=?, coach_salt=?, coach_password=? WHERE coach_id=?', [user.fullName, user.email, user.avatar, user.salt, user.password, id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows updated, no such coach
                throw new Error("No such user");
            }
            return true; // update successful
        });
    },

    deleteCoach: (id) => {
        return db.query('DELETE FROM coach WHERE coach_id=?', [id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows deleted, no such coach
                throw new Error("No such user");
            }
            return true; // deletion successful
        });
    },

    getCoachesByPlayerId: (id) => {
        return db.query('SELECT * FROM coach JOIN player_coach ON pcs_coach_id=coach_id JOIN player ON pcs_player_id=player_id WHERE pcs_player_id=?', [id]).then(rows => {
            return rows.map(row => new Coach(row));
        });
    },

    followCoach: (playerId, coachId) => {
        return db.query('INSERT INTO player_coach (pcs_player_id, pcs_coach_id) VALUES (?, ?)', [playerId, coachId]).then(result => {
            if(result.affectedRows === 1) {
                return true;
            }
            throw new Error('Player could not be linked to Coach');
        }).catch(err => {
            // If the Player already follows this coach
            if (err.code === 'ER_DUP_ENTRY') {
                const error = new Error('Player already follows this coach');
                error.code = 409; // Conflict
                throw error;
            }
            throw err;
        });
    },

};
