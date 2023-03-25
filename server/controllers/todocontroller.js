var ObjectId = require('mongoose').Types.ObjectId;
const Tasks = require("../../model/tasks");
var _ = require('lodash');

/**
 * This api endpoint is used to create new tasks
 * @param {*} req 
 * @param {*} res 
 * @returns newly created task doc if no error occured else the error message
 */
const createTask = async (req, res) => {
    try {
        const {task} = req.body;

        const userDoc = res.locals.userdoc;
        // Check for all the inputs and should not be empty or null
        if (!task) {
            res.status(400).send("A Todo can not be created with empty content");
            return
        }
        const taskDoc = await Tasks.create({
            task,
            user: userDoc.id.toString(),
            createdAt: new Date()
        });
        res.status(200).send(taskDoc);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api Endpoint to mark a task as completed
 * @param {*} req 
 * @param {*} res 
 * @returns success message if operation is successfull or else error message
 */
const markAsCompleted = async (req, res) => {
    try {
        const { params } = req;
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        const userDoc = res.locals.userdoc;
        const todoDoc = await Tasks.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        });
        if (!todoDoc) {
            res.status(401).send("The task is not available anymore.");
            return
        }
        if (todoDoc && todoDoc.user.toString() != userDoc.id.toString()) {
            res.status(401).send("You can mark your own tasks as completed.");
            return
        }
        const response = await Tasks.updateOne({
            _id: new ObjectId(params.id)
        }, {
            completed: true,
            completedAt: new Date()
        });
        res.status(200).send("Task marked as completed successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Edit the Task Title
 * @param {*} req 
 * @param {*} res 
 * @returns return the updated task document if successfull otherwise error message
 */
const editTask = async (req, res) => {
    try {
        const { params, body} = req;
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        if (!body.task) {
            res.status(400).send("Please provide some content to update the todo");
            return
        }
        const userDoc = res.locals.userdoc;
        const todoDoc = await Tasks.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        });
        if (!todoDoc) {
            res.status(401).send("The task is not available anymore.");
            return
        }
        if (todoDoc && todoDoc.user.toString() != userDoc.id.toString()) {
            res.status(401).send("You can edit your own tasks only.");
            return
        }
        const updatedDoc = await Tasks.findOneAndUpdate({
            _id: new ObjectId(params.id)
        }, {
            task: body.task
        }, {
            returnDocument: 'after'
        });
        res.status(200).send(updatedDoc);
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Delete a Todo
 * @param {*} req 
 * @param {*} res 
 * @returns Successfull message if deleted success otherwise error message
 */
const deleteTask = async (req, res) => {
    try {
        const { params } = req;
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        const userDoc = res.locals.userdoc;
        const todoDoc = await Tasks.findOne({
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        });
        if (!todoDoc) {
            res.status(401).send("The task is not available anymore.");
            return
        }
        if (todoDoc && todoDoc.user.toString() != userDoc.id.toString()) {
            res.status(401).send("You can delete youw own todo item.");
            return
        }
        const response = await Tasks.updateOne({
            _id: new ObjectId(params.id),
        }, {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: userDoc.id.toString()
        });
        if (!response || !response.modifiedCount) {
            res.status(400).send("Can not delete the post;");
            return
        }
        res.status(200).send("Todo deleted successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

/**
 * Api Endpoint to fetch tasks
 * @param {*} req 
 * @param {*} res 
 * @returns returns all tasks for all the users or a specific user
 */
const fetchTasks = async (req, res) => {
    try {
        const {query} = req;
        // const userDoc = res.locals.userdoc;
        // Check for all the inputs and should not be empty or null
        const taskquery = {
            deleted: {'$ne': true},
            completed: {'$ne': true}
        }
        let limit = parseInt(query.limit) || 10;
        let skip = parseInt(query.skip) || 0;
        let sort = query.sort || {'createdAt': 'asc'};;
        if (query.user) {
            let userData = (query.user.startsWith('[')) ? JSON.parse(query.user) : query.user;
            taskquery.user = (Array.isArray(userData)) ? {'$in': userData.map(element => {
                return new ObjectId(element)
            })} : new ObjectId(userData);
        }
        // Return todos after a specific date or in a daterange
        if (query.createdAt && !_.isEmpty(query.createdAt)) {
            taskquery.createdAt = {};
            _.mapValues(JSON.parse(query.createdAt), function(value, key) {
                let tempQuery = {}
                tempQuery[key] = new Date(value)
                taskquery.createdAt = Object.assign(taskquery.createdAt, tempQuery);
                return value
            })
        }
        // Query to fetch completed tasks
        // As by default we are only serving non-completed tasks
        if (query.completed) {
            taskquery.completed = true;
        }
        const tasks = await Tasks.find(taskquery).skip(skip).limit(limit).sort(sort).populate('user', 'firstname lastname email');
        const totalCount = await Tasks.count(taskquery);
        res.status(200).send({
            'tasks': tasks,
            'totalCount': totalCount,
            'skip': (totalCount > skip + limit) ? skip + limit : skip + tasks.length
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
};

module.exports = {createTask, markAsCompleted, editTask, deleteTask, fetchTasks}