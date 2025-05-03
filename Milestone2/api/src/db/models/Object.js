module.exports = class Play {
    id = null;
    object_x = null;
    object_y = null;
    color = null;
  
    constructor(data) {
      this.id = data.play_id;
      this.object_x = data.object_x;
      this.object_y = data.object_y;
      this.color = data.object_color;
    }
  
    toJSON() {
      return {
        id: this.id,
        object_x: this.object_x,
        object_y: this.object_y,
        color: this.color
      }
    }
  };