const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../models/User');

// Page 1: Basic User Info
router.get('/', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, gender, college, collegeId, degree } = req.body;

        // Create a new user with the additional fields
        const user = new User({
            name,
            email,
            phone,
            gender,
            college,
            collegeId,
            degree,
            interests: {}, // Assuming this will be filled later
            questions: {}, // Assuming this will be filled later
        });

        await user.save();

        // Store the userId in a cookie
        res.cookie('userId', user._id.toString(), { maxAge: 60000, httpOnly: true }); // Cookie expires in 1 minute

        // Redirect to interests page
        res.redirect('/interests');
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).send('An error occurred.');
    }
});

// Page 2: Interests
router.get('/interests', (req, res) => {
    const userId = req.cookies.userId;

    // If no userId in cookies, redirect to signup
    if (!userId) {
        return res.redirect('/');
    }

    res.render('interests', { userId });
});

router.post("/interests", async (req, res) => {
    try {
        const userId = req.cookies.userId;

        // If no userId in cookies, return an error
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send("Invalid user ID");
        }

        // Update user interests
        await User.findByIdAndUpdate(userId, { interests: req.body.interests });

        // Redirect to questions page
        res.redirect('/questions');
    } catch (error) {
        console.error("Error saving interests:", error);
        res.status(500).send("An error occurred while saving interests");
    }
});

// Page 3: Questions
router.get("/questions", (req, res) => {
    const userId = req.cookies.userId;

    // If no userId in cookies, return an error
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send("Invalid user ID");
    }

    res.render("questions", { userId });
});

router.post('/questions', async (req, res) => {
    try {
        const { qualities, hobbies, about } = req.body;
        const userId = req.cookies.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        // Update the user record with questions data
        await User.findByIdAndUpdate(userId, {
            $set: {
                'questions.qualities': qualities,
                'questions.hobbies': hobbies,
                'questions.about': about,
            },
        });

        res.redirect('/thankyou');
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).send('An error occurred while saving questions');
    }
});

// Page 4: Thank You
router.get('/thankyou', async (req, res) => {
    try {
        // Retrieve the userId from cookies
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(400).send("User ID not found in cookies. Please register again.");
        }

        // Pass the userId to the thank-you page
        res.render('thankyou', { userId });
    } catch (err) {
        console.error('Error loading thank-you page:', err);
        res.status(500).send('An error occurred.');
    }
});

module.exports = router;
