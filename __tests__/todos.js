const server = require('../server/app')
const helper = require('./helper/helper');
var ObjectId = require('mongoose').Types.ObjectId;

const mongoose = require('mongoose');

const assert = require('assert');
const request = require('supertest');

describe('Todos', () => {
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_TEST_URI);
    })

    describe('Test Add todo Endpoint', () => {
        it('Should return an added todo with status code 200', async () => {
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
                task: "A new todo task has been created"
            }

            const response = await request(server)
                .post(`/todos/`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
                .send(requestBody)

            assert.equal(response.statusCode, 200);
            expect(response.body.user).toEqual(user._id.toString());
            expect(response.body.task).toEqual("A new todo task has been created");
        })
    })

    describe('Test Mark a task as completed Endpoint', () => {
        it('Should return an message "Task marked as completed successfully" with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }
            const todoData = await helper.createToDo(user.id, "Sample Todo")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .post(`/todos/${todoData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
                .send({})
            assert.equal(response.statusCode, 200);
            expect(response.text).toEqual("Task marked as completed successfully");
        })
    })

    describe('Test Edit a todo Endpoint', () => {
        it('Should return updated todo document with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            const todoData = await helper.createToDo(user.id, "Sample Todo")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .put(`/todos/${todoData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
                .send({
                    "task": "Sample todo task updated"
                })
            assert.equal(response.statusCode, 200);
            expect(response.body.task).toEqual('Sample todo task updated')
            assert.equal(response.body.id, todoData._id.toString())
        })
    })

    describe('Test Delete a todo Endpoint', () => {
        it('Should return message "Todo deleted successfully" with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            const todoData = await helper.createToDo(user.id, "Sample Todo")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .delete(`/todos/${todoData._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            expect(response.text).toEqual("Todo deleted successfully");
        })
    })

    describe('Test Get todos Endpoint', () => {
        it('Should return all todos for a specific user with status code 200', async () => {
            const password = "Password;"
            const randomUsername = (Math.random() + 1).toString(36).substring(7);
            const email = `test@${randomUsername}.com`
            
            // Create a random user
            const user = await helper.createUser(randomUsername, email, password)
            const loginInfo = {
                email,
                password
            }

            await helper.createToDo(user.id, "Sample Todo")
            await helper.createToDo(user.id, "Sample Todo Data 2")

            const loggedIn = await request(server).post('/login').send(loginInfo);

            const response = await request(server)
                .get(`/todos?user=${user._id.toString()}`)
                .set('Authorization', `Bearer ${loggedIn.body.token}`)
            assert.equal(response.statusCode, 200);
            expect(response.body.tasks).toHaveLength(2)
            assert.equal(response.body.tasks[1].task, 'Sample Todo Data 2')
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