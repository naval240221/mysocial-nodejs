const server = require('../server/app')
const helper = require('./helper/helper');

const mongoose = require('mongoose');

const assert = require('assert');
const request = require('supertest');
const { expect } = require('@jest/globals');

describe('Comments', () => {
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
    })

    describe('Test Add Comment Endpoint', () => {
        it('Should return an added comment with status code 200', async () => {
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

            const loggedIn = await request(server).post('/login').send(loginInfo);
            const commentBody = {
                content: "Comment Added to a post"
            }

            const response = await request(server)
                .post(`/posts/${postData._id.toString()}/comments`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
                .send(commentBody)

            assert.equal(response.statusCode, 200);
            expect(response.body.post).toEqual(postData._id.toString());
        })
    })

    describe('Test Delete a Comment Endpoint', () => {
        it('Should return an message "Comment deleted successfully" with status code 200', async () => {
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
            const commentData = await helper.createComment(user.id, postData._id, "Sample Comment")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .delete(`/posts/${postData._id.toString()}/comments?id=${commentData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            expect(response.text).toEqual("Comment deleted successfully");
        })
    })

    describe('Test Get Comments Endpoint', () => {
        it('Should return all comments for a specific post with status code 200', async () => {
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
                .get(`/posts/${postData._id.toString()}/comments`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            expect(response.body.comments).toHaveLength(2)
            assert.equal(response.body.comments[0].content, 'Sample Comment')
            assert.equal(response.body.totalCount, 2)
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