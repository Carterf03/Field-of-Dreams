const crypto = require('crypto');

module.exports = class User {
  id = null;
  full_name = null;
  email = null;
  avatar = null;
  #salt = null;;
  #passwordHash = null;;

  constructor(data) {
    this.id = data.player_id;
    this.full_name = data.player_full_name;
    this.email = data.player_email;
    this.avatar = data.player_avatar;
    this.#salt = data.player_salt;
    this.#passwordHash = data.player_password;
  }

  validatePassword(password) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, this.#salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) { //problem computing digest, like hash function not available
         reject("Error: " + err);
        }

        const digest = derivedKey.toString('hex');
        if (this.#passwordHash == digest) {
          resolve(this);
        }
        else {
          reject("Invalid username or password");
        }
      });
    });
  }

  toJSON() {
    return {
      id: this.id,
      full_name: this.full_name,
      email: this.email,
      avatar: this.avatar
    }
  }
};