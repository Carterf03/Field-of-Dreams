const db = require('./DBConnection');

const Frame = require('./models/Frame');

module.exports = {

    getFramesByPlayId: (id) => {
        return db.query('SELECT * FROM frame JOIN play_frame ON pfs_frame_id=frame_id JOIN play ON pfs_play_id=play_id WHERE pfs_play_id=?', [id]).then(rows => {
            return rows.map(row => new Frame(row));
        });
    },

    getFrameByFrameId: (id) => {
        return db.query('SELECT * FROM frame WHERE frame_id=?', [id]).then(rows => {
            if (rows.length === 1) { // we found our user
                return new Frame(rows[0]);
            }
            // if no user with provided username
            throw new Error("No such user");
        });
    },

    createNewFrame: (playId, frame) => {
        return db.query('INSERT INTO frame (ball_x, ball_y) VALUES (?, ?)', [frame.ball_x, frame.ball_y]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows inserted, no such play
                throw new Error("No such play");
            }
            return module.exports.connectFrameToPlay(playId, rows.insertId); // insertion successful
        });
    },

    connectFrameToPlay: (playId, frameId) => {
        return db.query('INSERT INTO play_frame (pfs_play_id, pfs_frame_id) VALUES (?, ?)', [playId, frameId]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows inserted, no such play
                throw new Error("No such play or frame");
            }
            return module.exports.getFrameByFrameId(frameId); // insertion successful
        });
    },
    
    updateFrame: (frame) => {
        return db.query('UPDATE frame SET ball_x=?, ball_y=? WHERE frame_id=?', [frame.ball_x, frame.ball_y, frame.frame_id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows updated, no such play
                throw new Error("No such play");
            }
            return true; // update successful
        });
    },
    
    deleteFrame: (id) => {
        return db.query('DELETE FROM play_frame WHERE pfs_frame_id=?', [id]).then(rows => {
            if (rows.affectedRows !== 0) {
                return db.query('DELETE FROM frame WHERE frame_id=?', [id]).then(rows => {
                    if (rows.affectedRows === 0) { //If no rows deleted, no such play
                        throw new Error("No such frame");
                    }
                    return true; // deletion successful
                });
            }
        });
    },

}