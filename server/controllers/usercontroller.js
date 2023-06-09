// Import User Context
const Authentication = require('../../middleware/authentication');
var ObjectId = require('mongoose').Types.ObjectId;
const User = require("../../model/user");
const Posts = require("../../model/posts");
const Tasks = require("../../model/tasks");
const bcrypt = require('bcrypt');
var _ = require('lodash');

/**
 * Register a new user
 * @param {*} req 
 * @param {*} res 
 * @returns If error occurs return error message else user doc with jwt token for next api calls
 */
const registerUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // Check for all the inputs and should not be empty or null
        if (!email || !password || !firstname || !lastname) {
            res.status(400).send("Please provide all the input details")
        }
        if (password.length < 8) {
            res.status(400).send("Password should be minimum length of 8 characters");
            return
        }
        // Check if any user already exists with the same email;
        const userExist = await User.findOne({email: email.toLowerCase()});
        if (userExist) {
            res.status(409).send("User already exist. Please proceed with login.");
            return
        }
        // If user does not exists then create the user
        const user = await User.create({
            firstname,
            lastname,
            email,
            password
        })
        // Create token
        const authToken = Authentication.generateAuthToken(user);
        const refreshToken = Authentication.generateRefreshToken(user);
        // Assigning refresh token in http-only cookie 
        res.cookie('jwt', refreshToken, { httpOnly: true, 
            sameSite: 'None', secure: true, 
            maxAge: 24 * 60 * 60 * 1000 });
        // save user token
        user.token = authToken;
        // return new user
        res.status(200).json(user);
        return
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

/**
 * Endpoint to logging onto the platform
 * @param {*} req 
 * @param {*} res 
 * @returns After validation of password, create jwt token and return the user doc
 */
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        // Check for all the inputs and should not be empty or null
        if (!email || !password) {
            res.status(400).send("Please provide all the input details");
            return
        }
        const userExist = await User.findOne({email: email.toLowerCase()});
        if (!userExist) {
            res.status(404).send("User does not exist with these details.");
            return
        }
        // If user have made 10 incorrectAttempt with password then do not let him
        // proceed further for atleast 6 hours
        if (userExist.temporaryBlocked) {
            res.status(403).send("You have made 10 consecutive unsuccesfull attempts in last 6 hours. You account has been temporary disabled")
            return
        }
        const isValidPassword = await bcrypt.compare(password, userExist.password);
        if (!isValidPassword) {
            let updateQuery = {}
            updateQuery['$inc'] = {'incorrectAttempt': 1}
            if (!userExist.incorrectAttempt) {
                updateQuery['$set'] = {'firstIncorrectAttemptAt': new Date()}
            } else {
                let now = new Date()
                let delta = Math.abs(now.getTime() - userExist.firstIncorrectAttemptAt.getTime()) / 1000;
                delta /= (60 * 60)
                if (parseInt(delta) < 6 && userExist.incorrectAttempt == 10) {
                    updateQuery['$set'] = {
                        "temporaryBlocked": true
                    }
                }
            }
            await User.updateOne({
                _id: new ObjectId(userExist._id)
            }, updateQuery)
            res.status(401).send("Incorrect email or password");
            return
        }
        if (userExist && isValidPassword) {
            // Create token
            await User.updateOne({
                _id: new ObjectId(userExist._id)
            }, {
                "$unset": {'incorrectAttempt': 0, 'firstIncorrectAttemptAt': 0}
            })
            delete userExist.incorrectAttempt;
            delete userExist.firstIncorrectAttemptAt;
            const authToken = Authentication.generateAuthToken(userExist);
            const refreshToken = Authentication.generateRefreshToken(userExist);
            // Assigning refresh token in http-only cookie 
            res.cookie('jwt', refreshToken, { httpOnly: true, 
                sameSite: 'None', secure: true, 
                maxAge: 24 * 60 * 60 * 1000 });
            // save user token
            userExist.token = authToken;
            // return user document
            res.status(200).json(userExist);
            return
          }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};


/**
 * Api endpoint to refresh access token
 * @param {*} req 
 * @param {*} res 
 */
const refreshAccessToken = async (req, res) => {
    try {
        if (req.cookie?.jwt) {
            // Destructuring refreshToken from cookie
            const refreshToken = req.cookies.jwt;
            const deconstructedUser = Authentication.extractUserForRefreshToken(refreshToken);
            if (deconstructedUser && deconstructedUser.id) {
                return res.status(200).send({
                    token: Authentication.generateAuthToken(userExist)
                })
            } else {
                return res.status(406).json({ message: 'Unauthorized' });
            }
        } else {
            return res.status(406).json({ message: 'Unauthorized' });
        }
    } catch (err) {
        res.status(500).send(err)
    }
}


const getUsers = async (req, res) => {
    try {
        const userDoc = res.locals.userdoc;
        let userquery = {
            _id: {'$ne': new ObjectId(userDoc.id)},
            deleted: {'$ne': true}
        }
        const {query} = req;
        // Return todos after a specific date or in a daterange
        if (query.createdAt && !_.isEmpty(query.createdAt)) {
            userquery.createdAt = {};
            _.mapValues(JSON.parse(query.createdAt), function(value, key) {
                let tempQuery = {}
                tempQuery[key] = new Date(value)
                userquery.createdAt = Object.assign(userquery.createdAt, tempQuery);
                return value
            })
        }
        // Support get user via email, firstname or lastname
        _.map(['firstname', 'lastname'], function(v) {
            if (query[v])   {
                userquery[v] = {
                    '$regex': new RegExp(query[v], 'i')
                }
            }
        })
        if (query.email) {
            userquery.email = query.email
        }
        let limit = parseInt(query.limit) || 10;
        let skip = parseInt(query.skip) || 0;
        let sort = query.sort || {'createdAt': 'asc'};
        if (typeof sort === 'string') {
            sort = JSON.parse(sort);
        }
        const users = await User.find(
            userquery, {firstname: 1, lastname: 1, email: 1}
        ).skip(skip).limit(limit).sort(sort)
        if (!users || !users.length) {
            res.status(404).send("No user exists")
            return
        }
        const totalCount = await User.count(userquery)
        res.status(200).send({
            'users': users,
            'total': totalCount
        })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { params } = req;
        if (!params.id) {
            res.status(400).send("Please provide all the input details");
            return
        }
        // const userDoc = res.locals.userdoc;
        let userquery = {
            _id: new ObjectId(params.id),
            deleted: {'$ne': true}
        }
        const userDoc = await User.findOne(
            userquery, {firstname: 1, lastname: 1, email: 1}
        )
        if (!userDoc) {
            res.status(404).send("User does not exist")
            return
        }
        const dataToSend = userDoc.toJSON();
        const totalPosts = await Posts.find({
            user: new ObjectId(dataToSend.id),
            deleted: {'$ne': true}
        }).skip(0).limit(50).sort({'createdAt': 'desc'})
        dataToSend.posts = (totalPosts && totalPosts.length) ? totalPosts : [];
        const TasksData = await Tasks.find({
            user: new ObjectId(dataToSend.id),
            deleted: {'$ne': true}
        }).skip(0).limit(50).sort({'createdAt': 'desc'})
        dataToSend.todos = (TasksData && TasksData.length) ? TasksData : [];
        res.status(200).send(dataToSend)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
};

module.exports = {registerUser, loginUser, getUsers, getUserDetails, refreshAccessToken};