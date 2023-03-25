// import * as user from './usercontroller'
// import * as posts from './postscontroller'

const user = require('./usercontroller');
const posts = require('./postscontroller');
const todo = require('./todocontroller');

module.exports = { user, posts, todo }