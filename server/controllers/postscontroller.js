
var ObjectId = require('mongoose').Types.ObjectId;
const Posts = require("../../model/posts");
const Comments = require("../../model/comments");
var _ = require('lodash');

/**
 * Api Endpint to create a post on the platform
 * @param {*} req 
 * @param {*} res 
 * @returns created Post in case of successfull creation else error if error occured
 */
const createPost = async (req, res) => {
    try {
        const {content} = req.body;
        const userDoc = res.locals.userdoc;
        // Check for all the inputs and should not be empty or null
        if (!content) {
            res.status(400).send("Post can not be created with empty content");
            return
        }
        const post = await Posts.create({
            content,
            user: userDoc.id.toString(),
            createdAt: new Date()
        });
        res.status(200).send(post);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api Endpoint ot delete a specific post
 * @param {*} req 
 * @param {*} res 
 * @returns Message id deleted successfully or error message if error occured
 */
const deletePost = async (req, res) => {
    try {
        const { params } = req
        // Check for all the inputs and should not be empty or null
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        const userDoc = res.locals.userdoc;
        const postExist = await Posts.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        });
        if (!postExist) {
            res.status(401).send("Post you are trying to delete either does not exist or has been deleted.");
            return
        }
        if (postExist && postExist.user.toString() != userDoc.id.toString()) {
            res.status(401).send("You can delete post only you authored.");
            return
        }
        const post = await Posts.updateOne({
            _id: new ObjectId(params.id)
        }, {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: userDoc.id.toString()
        });
        if (!post || !post.modifiedCount) {
            res.status(400).send("Can not delete the post;")
        }
        res.status(200).send("Post deleted successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api Endpoint to update a specific post
 * @param {*} req 
 * @param {*} res 
 * @returns update the text of the post and return updated document, error if error
 */
const updatePost = async (req, res) => {
    try {
        const { params, body } = req;
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        const userDoc = res.locals.userdoc;
        const postExist = await Posts.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        });
        if (!postExist) {
            res.status(401).send("Post you are trying to delete either does not exist or has been deleted.");
            return
        }
        if (postExist && postExist.user.toString() != userDoc.id.toString()) {
            res.status(401).send("You can update post only you authored.");
            return
        }
        const post = await Posts.findOneAndUpdate({
            _id: new ObjectId(params.id)
        }, {
            content: body.content
        }, {
            returnDocument: 'after'
        });
        res.status(200).send(post);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api endpoint to fetch posts of all users
 * @param {*} req 
 * @param {*} res 
 * @returns Return posts along with the top five comments for each posts
 * Does support the pagination, sort
 */
const fetchPosts = async (req, res) => {
    try {
        const { query } = req;
        // if (!params.id) {
        //     res.status(400).send("Please provide all the input details");
        //     return
        // }
        // By Default return 50 posts with every post
        let limit = parseInt(query.limit) || 50;
        let skip = parseInt(query.skip) || 0;
        let sort = query.sort || {'createdAt': 'asc'};;
        // const userDoc = res.locals.userdoc;
        let postQuery = {
            deleted: {'$ne': true}
        }
        // If want to fetch posts for a specific user
        if (query.user) {
            postQuery.user = new ObjectId(query.user)
        }
        // Return posts after a specific date or in a daterange
        if (query.createdAt && !_.isEmpty(query.createdAt)) {
            postQuery.createdAt = {};
            _.mapValues(JSON.parse(query.createdAt), function(value, key) {
                let tempQuery = {}
                tempQuery[key] = new Date(value)
                postQuery.createdAt = Object.assign(postQuery.createdAt, tempQuery);
                return value
            })
        }
        const postsData = await Posts.find(postQuery).skip(skip).limit(limit).sort(sort).populate(
            'user', 'firstname lastname email'
        ).populate({
            path: 'comments', options: {
                sort: {'createdAt': 'desc'},
                limit: 5 // Reterieve only top 5 comments for a particular post
            }
        });
        const totalPosts = await Posts.count(postQuery)
        if (!postsData || !postsData.length) {
            res.status(401).send("No posts are available.");
            return
        }
        res.status(200).send({
            'posts': postsData,
            'skip': (totalPosts > skip + limit) ? skip + limit : skip + postsData.length,
            'totalCount': totalPosts
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api endpoint to get complete details of a post along with its all comments
 * @param {*} req 
 * @param {*} res 
 * @returns return post along with its all comments
 */
const getPost = async (req, res) => {
    try {
        const { params } = req;
        // Check for all the inputs and should not be empty or null
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        // const userDoc = res.locals.userdoc;
        const postDoc = await Posts.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        }).populate('user', 'firstname lastname email')
        .populate({path: 'comments', options: {
            sort: {'createdAt': 'desc'}
        }});
        if (!postDoc) {
            res.status(404).send("Post details is not available.");
            return
        }
        res.status(200).send(postDoc);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Create comment on a post
 * @param {*} req 
 * @param {*} res 
 * @returns Return error if any error occured else created comment
 */
const createComment = async (req, res) => {
    try {
        const { params, body } = req;
        if (!params.id) {
            res.status(400).send("Please provide all input details");
            return
        }
        const userDoc = res.locals.userdoc;
        const postExist = await Posts.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        });
        if (!postExist) {
            res.status(401).send("Post you are trying to delete either does not exist or has been deleted.");
            return
        }
        let commentData = Object.assign({}, body);
        commentData.post = params.id;
        commentData.addedBy = userDoc.id;
        commentData.createdAt = new Date();
        var comment = await Comments.create(commentData);
        if (comment && (comment._id || comment.id)) {
            const res = await Posts.updateOne({
                _id: new ObjectId(params.id),
                deleted: {'$ne': true}
            }, {'$addToSet': {'comments': comment.id}});
        }
        res.status(200).send(comment);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Delete Comment
 * @param {*} req 
 * @param {*} res 
 * @returns Message of successfull deletion if no error occured else error message
 */ 
const deleteComment = async (req, res) => {
    try {
        const { params, query } = req;
        if (!params.id) {
            res.status(400).send("Please provide all input details");
            return
        }
        const userDoc = res.locals.userdoc;
        const commentDoc = await Comments.findOne({
            _id: new ObjectId(query.id),
            deleted: {'$ne': true}
        });
        if (!commentDoc) {
            res.status(401).send("Comment you are trying to delete either does not exist or has been deleted.");
            return
        }
        if (commentDoc.addedBy.toString() != userDoc.id.toString()) {
            res.status(400).send("You can delete only your added comments.")
            return
        }
        const comment = await Comments.updateOne({
            _id: new ObjectId(query.id)
        }, {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: userDoc.id.toString()
        });
        if (!comment || !comment.modifiedCount) {
            res.status(400).send("Can not delete this comment;")
            return
        }
        const newres = await Posts.updateOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        }, {
            $pull: {comments: new ObjectId(commentDoc.id)}
        });
        res.status(200).send("Comment deleted successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api to fetch comments related to a specific post
 * @param {*} req 
 * @param {*} res 
 * @returns Return comments related to a post if operation succesfull else error message if error appears
 */
const fetchAllComments = async (req, res) => {
    try {
        const { query, params } = req;
        // By Default return 50 posts with every post
        let limit = parseInt(query.limit) || 50;
        let skip = parseInt(query.skip) || 0;
        let sort = query.sort || {'createdAt': 'asc'};;
        // const userDoc = res.locals.userdoc;
        let commentsQuery = {
            deleted: {'$ne': true},
            post: new ObjectId(params.id)
        }
        // If want to fetch posts for a specific user
        if (query.user) {
            commentsQuery.user = new ObjectId(query.user)
        }
        // Return posts after a specific date or in a daterange
        if (query.createdAt && !_.isEmpty(query.createdAt)) {
            commentsQuery.createdAt = {};
            _.mapValues(JSON.parse(query.createdAt), function(value, key) {
                let tempQuery = {}
                tempQuery[key] = new Date(value)
                commentsQuery.createdAt = Object.assign(commentsQuery.createdAt, tempQuery);
                return value
            })
        }
        const commentsData = await Comments.find(commentsQuery).skip(skip).limit(limit).sort(sort).populate(
            'addedBy', 'firstname lastname email'
        );
        const totalComments = await Comments.count(commentsQuery)
        if (!commentsData || !commentsData.length) {
            res.status(401).send("No More comments.");
            return
        }
        res.status(200).send({
            'comments': commentsData,
            'skip': (totalComments > skip + limit) ? skip + limit : skip + commentsData.length,
            'totalCount': totalComments
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

module.exports = {createPost, deletePost, updatePost, getPost, fetchPosts, createComment, deleteComment, fetchAllComments};