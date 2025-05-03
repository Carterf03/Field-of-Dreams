module.exports = class Object {
    id = null;
    player_id = null;
    object_x = null;
    object_y = null;
    color = null;
  
    constructor(data) {
      this.id = data.object_id;
      this.player_id = data.player_id;
      this.object_x = data.object_x;
      this.object_y = data.object_y;
      this.color = data.object_color;
    }
  
    toJSON() {
      return {
        id: this.id,
        player_id: this.player_id,
        object_x: this.object_x,
        object_y: this.object_y,
        color: this.color
      }
    }
  };