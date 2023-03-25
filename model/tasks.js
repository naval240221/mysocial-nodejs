const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
  task: { type: String, required: true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  deleted: {type: Boolean},
  deletedAt: {type: Date},
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  createdAt: { type: Date},
  completed: { type: Boolean, default: false},
  completedAt: { type: Date }
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

module.exports = mongoose.model("tasks", tasksSchema);