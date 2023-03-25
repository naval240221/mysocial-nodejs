const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  content: { type: String, required: true},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'posts', required: true},
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  createdAt: { type: Date},
  deleted: { type: Boolean },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
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

module.exports = mongoose.model("comments", commentsSchema);