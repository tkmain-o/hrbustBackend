const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TimSchema = new mongoose.Schema({
  openid: { type: String, required: true },
  nickName: String,
  avatar: String,
  isAnonymous: { type: Boolean, default: false },
  device: String,
  content: String,
  isAdmin: { type: Boolean, default: false },
  isAuthor: { type: Boolean, default: false },
  isFixed: String,
  isVerified: { type: Boolean, default: false },
  location: String,
  latitude: String,
  longitude: String,
  images: [String],
  dateCreated: String,
  like: { type: Boolean, default: false },
  likeNum: { type: Number },
  likes: [String],
  dislikes: [String],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  commentNum: { type: Number, default: 0 },
});

const commentSchema = new mongoose.Schema({
  username: String,
  userid: String,
  cid: String,
  avatar: String,
  isAdmin: { type: Boolean, default: false },
  isAuthor: { type: Boolean, default: false },
  replyToName: String,
  replyTo: String,
  unread: { type: Boolean, default: true },
  content: String,
  dateCreated: String,
  like: { type: Boolean, default: false },
  likeNum: { type: Number, default: 0 },
  likes: [String],
  dislikes: [String],
  isAnonymous: { type: Boolean, default: false },
});
commentSchema.statics = {
  findById(id, cb) {
    return this.findOne({ id }).exec(cb);
  },
};
const Tim = mongoose.model('Tim', TimSchema);
const Comments = mongoose.model('Comment', commentSchema);
exports.Tim = Tim;
exports.Comment = Comments;
