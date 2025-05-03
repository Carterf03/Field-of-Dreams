module.exports = class Play {
  id = null;
  title = null;
  preview = null;

  constructor(data) {
    this.id = data.play_id;
    this.title = data.play_title;
    this.preview = data.play_preview;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      preview: this.preview
    }
  }
};