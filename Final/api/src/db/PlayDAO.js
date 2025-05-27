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

    deletePlay: async (id) => {

        // Delete coach_play entries
        await db.query('DELETE FROM coach_play WHERE cps_play_id = ?', [id]);

        // Get related frame_ids from play_frame
        const frameRows = await db.query('SELECT pfs_frame_id FROM play_frame WHERE pfs_play_id=?', [id]);

        for (const frameRow of frameRows) {

            // Get object_ids from frame_object
            const objectRows = await db.query('SELECT fos_object_id FROM frame_object WHERE fos_frame_id=?', [frameRow.pfs_frame_id]);

            // Delete frame_object entries and objects for each object id
            for (const objectRow of objectRows) {
                await db.query('DELETE FROM frame_object WHERE fos_object_id=?', [objectRow.fos_object_id]);
                await db.query('DELETE FROM object WHERE object_id=?', [objectRow.fos_object_id]);
            }

            // Delete play_frame entries and frames for each frame id
            await db.query('DELETE FROM play_frame WHERE pfs_frame_id=?', [frameRow.pfs_frame_id]);
            await db.query('DELETE FROM frame WHERE frame_id=?', [frameRow.pfs_frame_id]);
        }

        // Delete play
        await db.query('DELETE FROM play WHERE play_id=?', [id]);
        return true;
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
