const db = require('./DBConnection');

const Object = require('./models/Object');

module.exports = {

    getObjectsByFrameId: (id) => {
        return db.query('SELECT * FROM object JOIN frame_object ON fos_object_id=object_id JOIN frame ON fos_frame_id=frame_id WHERE fos_frame_id=?', [id]).then(rows => {
            return rows.map(row => new Object(row));
        });
    },

    getObjectsByPLayerId: (id) => {
        return db.query('SELECT * FROM object WHERE player_id=?', [id]).then(rows => {
            return rows.map(row => new Object(row));
        });
    },

    createNewObject: (frameId, object) => {
        return db.query('INSERT INTO object (player_id, object_x, object_y, object_color) VALUES (?, ?, ?, ?)', [object.player_id, object.object_x, object.object_y, object.object_color]).then(result => {
            if (result.affectedRows === 0) { //If no rows inserted, no such play
                throw new Error("No such object");
            }
            return module.exports.connectObjectToFrame(frameId, result.insertId); // insertion successful
        });
    },

    connectObjectToFrame: (frameId, objectId) => {
        return db.query('INSERT INTO frame_object (fos_frame_id, fos_object_id) VALUES (?, ?)', [frameId, objectId]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows inserted, no such play
                throw new Error("No such frame or object");
            }
            return true; // insertion successful
        });
    },

    updateObject: (object) => {
        return db.query('UPDATE object SET object_id=?, player_id=?, object_x=?, object_y=?, object_color=? WHERE object_id=?', [object.object_id, object.player_id, object.object_x, object.object_y, object.object_color, object.object_id]).then(rows => {
            if (rows.affectedRows === 0) { //If no rows updated, no such play
                throw new Error("No such play");
            }
            return true; // update successful
        });
    },

    deleteObject: (id) => {
        return db.query('DELETE FROM frame_object WHERE fos_object_id=?', [id]).then(rows => {
            if (rows.affectedRows !== 0) {
                return db.query('DELETE FROM object WHERE object_id=?', [id]).then(rows => {
                    if (rows.affectedRows === 0) { //If no rows deleted, no such play
                        throw new Error("No such object");
                    }
                    return true; // deletion successful
                });
            }
        });
    },

}