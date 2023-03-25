const server = require('../server/app')
const User = require("../model/user");
const Tasks = require("../model/tasks");
const Posts = require("../model/posts");
const Comments = require("../model/comments");
const helper = require('./helper/helper');
const Authentication = require('../middleware/authentication');
var ObjectId = require('mongoose').Types.ObjectId;

const mongoose = require('mongoose');

const assert = require('assert');
const request = require('supertest');
// const { describe } = require("node:test");


describe('Users', () => {
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
    })

    describe('Test Add User Endpoint', () => {
        it('Should return a 200 status response', async() => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            const postBody = {
                firstname: randomUsername,
                lastname: randomUsername,
                email,
                password
            }

            const response = await request(server).post('/user').send(postBody)
            expect(response.body.username).toEqual(postBody.username)

            const generatedToken = response.body.token // expect a token
            const user = Authentication.extractUser(`Bearer ${generatedToken}`)

            assert.equal(response.statusCode, 200);
            assert.equal(user.firstname, postBody.firstname);
            assert.equal(user.lastname, postBody.lastname)
            assert.equal(user.email, postBody.email)
        })
    })

    describe('Test login user endpoint', () => {
        it('Should return an auth token with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const requestBody = {
                email,
                password
            }

            const response = await request(server).post('/login').send(requestBody)
            assert.equal(response.statusCode, 200);
            expect(response.body.firstname).toEqual(user.firstname);

            // Correct Auth token should be returned
            const authUser = Authentication.extractUser(
                `Bearer ${response.body.token}`
            )
            assert.equal(authUser.id, user.id)
        })
    })

    describe('Logging in with wrong password', () => {
        it('Should return a response status code of 401 and error message', async () => {
          // GIVEN a created user
          const password = 'PASSWORD'
          const randomUsername = (Math.random() + 1).toString(36).substring(7)
          const email = `test@${randomUsername}.com`
    
          await helper.createUser(randomUsername, email, password)
    
          // WHEN the user attempts to log in with the wrong password
          const loginInfo = {
            email,
            password: 'InvalidPassword',
          }
          const response = await request(server).post('/login').send(loginInfo)
          // THEN a response with status code 401 should be returned along with an error message
          assert.equal(response.statusCode, 401)
          assert.equal(response.error.text, 'Incorrect email or password')
        })
    })

    describe('Get all users', () => {
        it('Should return an array of users except the requesting one 200', async () => {
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
            const response = await request(server)
                .get(`/user`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            const totalUsers = await User.count({deleted: {'$ne': true}, _id: {'$ne': new ObjectId(loggedIn.body.id)}})
            expect(response.body.users).toHaveLength(totalUsers)
        })
    })

    describe('Get a user details', () => {
        it('Should return details of a user along with posts, todo 200', async () => {
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
            await helper.createToDo(user.id, "Sample Todo")
            const loggedIn = await request(server).post('/login').send(loginInfo);
            const response = await request(server)
                .get(`/user/${user._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            assert.equal(response.body.firstname, randomUsername)
            assert.equal(response.body.email, email)
            assert.equal(response.body.posts[0].content, "Sample Post")
            assert.equal(response.body.todos[0].task, "Sample Todo")
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