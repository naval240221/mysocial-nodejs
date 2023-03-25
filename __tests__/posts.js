const server = require('../server/app')
const helper = require('./helper/helper');
const Posts = require('../model/posts')

const mongoose = require('mongoose');

const assert = require('assert');
const request = require('supertest');

describe('Posts', () => {
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
    })

    describe('Test Add Post Endpoint', () => {
        it('Should return an added Post with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            const loggedIn = await request(server).post('/login').send(loginInfo);
            const requestBody = {
                content: "Sample Post added"
            }

            const response = await request(server)
                .post(`/posts/`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
                .send(requestBody)

            assert.equal(response.statusCode, 200);
            expect(response.body.user).toEqual(user._id.toString());
            expect(response.body.content).toEqual("Sample Post added");
        })
    })

    describe('Get a Post Details', () => {
        it('Should return a post with its relevant comments with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }
            const postData = await helper.createPost(user.id, "Sample Post")
            await helper.createComment(user.id, postData._id, "Sample Comment")
            await helper.createComment(user.id, postData._id, "Sample Comment 2")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .get(`/posts/${postData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            assert.equal(response.body.content, "Sample Post")
            expect(response.body.comments).toHaveLength(2);
            assert(response.body.user.firstname, randomUsername)
            assert.equal(response.body.comments[0].content, "Sample Comment 2")
        })
    })

    describe('Test Edit a Post Endpoint', () => {
        it('Should return updated Post document with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            const PostData = await helper.createPost(user.id, "Sample Post")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .put(`/posts/${PostData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
                .send({
                    "content": "Sample Post has been updated"
                })
            assert.equal(response.statusCode, 200);
            expect(response.body.content).toEqual('Sample Post has been updated')
            assert.equal(response.body.id, PostData._id.toString())
        })
    })

    describe('Test Delete a Post Endpoint', () => {
        it('Should return message "Post deleted successfully" with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            const PostData = await helper.createPost(user.id, "Sample Post")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .delete(`/posts/${PostData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            expect(response.text).toEqual("Post deleted successfully");
        })
    })

    describe('Test Get Posts Endpoint', () => {
        it('Should return all Posts for all users with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            await helper.createPost(user.id, "Sample Post")
            await helper.createPost(user.id, "Sample Post Data 2")

            const loggedIn = await request(server).post('/login').send(loginInfo);
            const totalPostsCount = await Posts.count({
                deleted: {'$ne': true}
            })
            const response = await request(server)
                .get(`/posts`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            expect(response.body.posts).toHaveLength(totalPostsCount)
            assert.equal(response.body.totalCount, totalPostsCount)
        })
    })

    afterAll(async () => {
        await mongoose.connections[0].dropCollection('users');
        await mongoose.connections[0].dropCollection('posts');
        await mongoose.connections[0].dropCollection('tasks');
        await mongoose.connections[0].dropCollection('comments');
        await mongoose.connection.close();
    })
})