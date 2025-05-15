const db = require('./DBConnection');

const Play = require('./models/Play');

module.exports = {
    getPlayByPlayId: (id) => {
        return db.query('SELECT * FROM play WHERE play_id=?', [id]).then(rows => {
            if (rows.length === 1) { // we found our user
                return new Play(rows[0]);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    getCoachPlays: (id) => {
        return db.query('SELECT * FROM play JOIN coach_play ON cps_play_id=play_id JOIN coach ON cps_coach_id=coach_id WHERE cps_coach_id=?', [id]).then(rows => {
            return rows.map(row => new Play(row));
        });
    },

    getPlayerPlays: (id) => {
        return db.query('SELECT * FROM play JOIN coach_play ON cps_play_id=play_id JOIN coach ON cps_coach_id=coach_id JOIN player_coach ON pcs_coach_id=coach_id JOIN player ON pcs_player_id=player_id WHERE pcs_player_id=?', [id]).then(rows => {
            return rows.map(row => new Play(row));
        });
    },

    deletePlay: (id) => {
        return db.query('DELETE FROM play WHERE play_id=?', [id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows deleted, no such play
                throw new Error("No such play");
            }
            return true; // deletion successful
        });
    },

    createNewPlay: (coachId, play) => {
        return db.query('INSERT INTO play (play_title, play_preview) VALUES (?, ?)', [play.playTitle, play.playPreview]).then(result => {
            if (result.affectedRows === 0) { //If no rows inserted, no such play
                throw new Error("No such play");
            }
            return module.exports.connectPlayToCoach(coachId, result.insertId); // insertion successful
        });
    },

    connectPlayToCoach: (coachId, playId) => {
        return db.query('INSERT INTO coach_play (cps_coach_id, cps_play_id) VALUES (?, ?)', [coachId, playId]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows inserted, no such play
                throw new Error("No such coach or play");
            }
            return module.exports.getPlayByPlayId(playId); // insertion successful
        });
    },

    updatePlay: (play) => {
        return db.query('UPDATE play SET play_title=?, play_preview=? WHERE play_id=?', [play.play_title, play.play_preview, play.play_id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows updated, no such play
                throw new Error("No such play");
            }
            return true; // update successful
        });
    },
}
