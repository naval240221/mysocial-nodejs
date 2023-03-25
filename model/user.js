'use strict';
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, default: ''},
  lastname: { type: String, default: '' },
  email: { type: String, unique: true, required: true , set: v => v.toLowerCase()},
  password: { type: String, required: true },
  token: { type: String },
  createdAt: {type: Date}
}, {
    id: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = doc._id;
            ret.id = ret.id.toString();
            delete ret._id
            delete ret.password;
        }
    }
});

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

module.exports = mongoose.model("users", userSchema);