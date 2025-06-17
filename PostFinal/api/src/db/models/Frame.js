module.exports = class Frame {
    id = null;
    ball_x = null;
    ball_y = null;
  
    constructor(data) {
      this.id = data.frame_id;
      this.ball_x = data.ball_x;
      this.ball_y = data.ball_y;
    }
  
    toJSON() {
      return {
        id: this.id,
        ball_x: this.ball_x,
        ball_y: this.ball_y
      }
    }
  };