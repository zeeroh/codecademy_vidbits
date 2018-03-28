const {mongoose} = require('../database');

const Video = mongoose.model(
  'Video',
  // Define your model schema below:
  mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  })
);

module.exports = Video;
