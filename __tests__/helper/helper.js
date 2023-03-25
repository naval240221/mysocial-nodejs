

const User = require("../../model/user");
const Tasks = require("../../model/tasks");
const Posts = require("../../model/posts");
const Comments = require("../../model/comments");

const assert = require('assert');
var ObjectId = require('mongoose').Types.ObjectId;


describe('This file needs at least one test', () => {
    it('Nothing', () => {
      assert.notEqual(2 + 2, 5)
    })
})

const Helper = class Helper {
    static async createUser(username, email, password) {
        const randomUsername = (Math.random() + 1).toString(36).substring(7)
        const user = await User.create({
            firstname: username || randomUsername,
            lastname: username || randomUsername,
            email: email || 'TEST@GMAIL.COM',
            password: password || 'PASSWORD'
        })
        return user
    }

    static async createPost(userid, text) {
        const post = await Posts.create({
            content: text || "Random post content",
            user: userid,
            createdAt: new Date()
        })
        return post
    }

    static async createToDo(userid, text) {
        const task = await Tasks.create({
            task: text || "Random todo task",
            completed: false,
            user: userid,
            createdAt: new Date()
        })
        return task
    }

    static async createComment(userid, postId, text) {
        const comment = await Comments.create({
            content: text || "Random comment",
            addedBy: userid,
            post: postId,
            createdAt: new Date()
        })
        await Posts.updateOne({
            _id: new ObjectId(postId)
        }, {
            '$addToSet': {
                "comments": [comment._id]
            }
        })
        return comment
    }
}

module.exports = Helper;