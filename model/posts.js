const mongoose = require("mongoose");

const postsSchema = new mongoose.Schema({
  content: { type: String, required: true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  createdAt: { type: Date},
  deleted: { type: Boolean },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comments'
  }]
}, {
    id: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = doc._id;
            ret.id = ret.id.toString();
            delete ret._id
        }
    }
});

module.exports = mongoose.model("posts", postsSchema);