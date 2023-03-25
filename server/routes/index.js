const express = require('express');
// import { auth } from '../../middlewares/auth'

const user = require('../controllers/usercontroller');
const post = require('../controllers/postscontroller');
const todo = require('../controllers/todocontroller');

const auth = require('../../middleware/auth');

const router = express.Router()

/**
 * All api route related to USER
 */

router
    .route('/user')
    .get(auth, user.getUsers)
    .post(user.registerUser)

router
    .route('/login')
    .post(user.loginUser)

router
    .route('/user/:id')
    .get(auth, user.getUserDetails)

router
    .route('/refresh')
    .get(user.refreshAccessToken)
/**
 * All API Routes related to create post
 * Add comment to it
 * Delete the posts
 */

router
    .route('/posts')
    .get(auth, post.fetchPosts)
    .post(auth, post.createPost)

router
    .route('/posts/:id')
    .get(auth, post.getPost)
    .put(auth, post.updatePost)
    .delete(auth, post.deletePost)

router
    .route('/posts/:id/comments')
    .get(auth, post.fetchAllComments)
    .post(auth, post.createComment)
    .delete(auth, post.deleteComment)


/**
 * All API Routes related to create todo
 * mark todo as completed
 * fetch all todos and can fetch for user specific as well
 */

router
    .route('/todos')
    .get(auth, todo.fetchTasks)
    .post(auth, todo.createTask)

router
    .route('/todos/:id')
    .post(auth, todo.markAsCompleted)
    .put(auth, todo.editTask)
    .delete(auth, todo.deleteTask)



module.exports = router;