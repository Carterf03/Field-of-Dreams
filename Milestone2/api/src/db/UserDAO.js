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

    registerCoach: (userData) => {
        return db.query('INSERT INTO coach (coach_full_name, coach_email, coach_avatar, coach_code, coach_salt, coach_password) VALUES (?, ?, ?, ?, ?, ?)', 
                        [userData.fullName, userData.email, userData.avatar, userData.coachCode, userData.salt, userData.password]).then(result => {
            if(result.affectedRows === 1) {
                return module.exports.getCoachById(result.insertId);
            }
            throw new Error('Coach could not be created');
        });
    },

    getAllUsers: () => {
        return db.query('SELECT * FROM player UNION SELECT * from coach').then(rows => {
            return rows.map(row => new Player(row));
        });
    },

    getCoachesByPlayerId: (id) => {
        return db.query('SELECT * FROM coach JOIN player_coach ON pcs_coach_id=coach_id JOIN player ON pcs_player_id=player_id WHERE pcs_player_id=?', [id]).then(rows => {
            return rows.map(row => new Coach(row));
        });
    },

    updateUser: (id, user) => {
        return db.query('UPDATE player SET player_first_name=?, player_last_name=?, player_email=? WHERE player_id=?', [user.firstName, user.lastName, user.email, id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows updated, no such player
                return db.query('UPDATE coach SET coach_first_name=?, coach_last_name=?, coach_email=? WHERE coach_id=?', [user.firstName, user.lastName, user.email, id]).then(rows => {
                    if (rows.affectedRows === 0) { //If no rows updated, no such coach
                        throw new Error("No such user");
                    }
                });
            }
            return true; // update successful
        });
    },

    deleteUser: (id) => {
        return db.query('DELETE FROM player WHERE player_id=?', [id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows deleted, no such player
                return db.query('DELETE FROM coach WHERE coach_id=?', [id]).then(rows => {
                    if (rows.affectedRows === 0) { //If no rows deleted, no such coach
                        throw new Error("No such user");
                    }
                });
            }
            return true; // deletion successful
        });
    }

};
