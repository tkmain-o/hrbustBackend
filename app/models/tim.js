const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TimSchema = new mongoose.Schema({
  userid: { type: String, required: true },
  username: String,
  male: Boolean,
  text: String,
  imgurl: String,
  dateCreated: [{
    type: Date,
    default: Date.now(),
  }],
  likes: [String],
  dislikes: [String],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
});

const commentSchema = new mongoose.Schema({
  username: String,
  userid: String,
  tousername: String,
  touserid: String,
  message: String,
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  likes: [String],
  dislikes: [String],
});
commentSchema.statics = {
  findById(id, cb) {
    return this.findOne({ id }).exec(cb);
  },
};
const Tim = mongoose.model('Tim', TimSchema);
// var Post = mongoose.model('Post');
const Comments = mongoose.model('Comment', commentSchema);
exports.Tim = Tim;
exports.Comment = Comments;
