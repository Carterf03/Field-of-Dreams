const crypto = require('crypto');

module.exports = class User {
  id = null;
  full_name = null;
  email = null;
  avatar = null;
  coach_code = null;
  #salt = null;;
  #passwordHash = null;;

  constructor(data) {
    this.id = data.coach_id;
    this.full_name = data.coach_full_name;
    this.email = data.coach_email;
    this.avatar = data.coach_avatar;
    this.coach_code = data.coach_code;
    this.#salt = data.coach_salt;
    this.#passwordHash = data.coach_password;
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
      avatar: this.avatar,
      coach_code: this.coach_code
    }
  }
};