const express = require('express');
const User = require('../models/User.js');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser.js');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


//ROUTE 1: create a user using POST /api/auth/createUser No login required

//validation checks from express-validator in array below
router.post('/createUser', [
    body('name', 'Name should be atleast 3 characters').isLength({ min: 3 }),
    body('password', 'Password should be atleast 5 characters').isLength({ min: 5 }),
    body('email', 'Please enter a valid email address').isEmail(),
], async (req, res) => {

    //if there are errors in validation, send bad req and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //check whether the user with this email already exists
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email already exists" });
        }

        //hashing user's password to store in db
        const salt = await bcrypt.genSalt(10);
        const secpassword = await bcrypt.hash(req.body.password, salt);

        //Creates a new user
        user = await User.create({
            name: req.body.name,
            password: secpassword,
            email: req.body.email
        });

        //send a token in response by converting user id (a unique identifier) to a jwt token
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        // res.json(user);
        res.json({ authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


})

//ROUTE 2: login a user using POST /api/auth/login No Login required

//validation checks from express-validator in array below
router.post('/login', [
    body('email', 'Please enter a valid email address').isEmail(),
    body('password', 'Password should not be empty').exists(),
], async (req, res) => {

    //if there are errors in validation, send bad req and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        //checks for email and password
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        //if user with the email entered doesnt exist
        if (!user) {
            return res.status(400).json({ error: "Please enter correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password); //this method returns a boolean value in passwordCompare
        if (!passwordCompare) {
            return res.status(400).json({ error: "Please enter correct credentials" });
        }

        //if everything is okay and no if statement is hit we give user the authToken
        //send a token in response by converting user id (a unique identifier) to a jwt token
        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);

        // res.json(user);
        success = true;
        res.json({ authToken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//ROUTE 3: Get user details using POST /api/auth/getUser Login required


router.post('/getUser', fetchUser , async (req, res) => {

    try {
        userId = req.user.id;
        const user = await User.findById(userId).select('-password')
        res.send(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


})
module.exports = router