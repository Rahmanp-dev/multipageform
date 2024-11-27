const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../models/User');
const nodemailer = require("nodemailer");

// Email setup using Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: "yudiapp54@gmail.com", // Replace with your email
      pass: "nuar rqsf slqa giai", // Replace with your email password or app-specific password
    },
  });

  // function to send thankyou mail
  const sendThankYouEmail = async (email, userId) => {
    if (!email) {
        console.error("No email provided for sending.");
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Yudi" <yudiapp54@gmail.com>', // Replace with your email
            to: email, // Dynamically insert the user's email
            subject: "Thank You for Registering!",
            text: `Hello!

Thank you for registering on Yudi!

Your User ID: ${userId}

We’ll update you about your match on your registered mobile number.

For any queries or data-related assistance, contact us at 6309849388.

Welcome aboard!
Team Yudi.`,
            
        });

        console.log("Email sent successfully:", info.response);
    } catch (err) {
        console.error("Error sending email:", err);
    }
};
// Function to generate a unique 4-digit user ID
const generateUniqueUserId = async () => {
    let userId;
    let isUnique = false;

    while (!isUnique) {
        userId = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a random 4-digit number
        const existingUser = await User.findOne({ uniqueId: userId });
        if (!existingUser) isUnique = true;
    }

    console.log("Generated uniqueId:", userId); // Debug log
    return userId;
};

// Page 1: Basic User Info
router.get('/', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, gender, college, collegeId, degree } = req.body;

        // Generate a unique ID for the user
        const uniqueId = await generateUniqueUserId();

        // Create a new user with the generated unique ID and provided data
        const user = new User({
            uniqueId, // Dynamically generated unique ID
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

        // Store the uniqueId in a cookie
        res.cookie('uniqueId', uniqueId, { maxAge: 3000000, httpOnly: true }); // Cookie expires in 5 minute
        res.cookie('email', email, { maxAge: 3000000, httpOnly: true });

        console.log("Saving user email:", email);

        // Redirect to interests page
        res.redirect('/interests');
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).send('An error occurred.');
    }
});

// Page 2: Interests
router.get('/interests', (req, res) => {
    const uniqueId = req.cookies.uniqueId;

    // If no uniqueId in cookies, redirect to signup
    if (!uniqueId) {
        return res.redirect('/');
    }

    res.render('interests', { uniqueId });
});

router.post("/interests", async (req, res) => {
    try {
        const uniqueId = req.cookies.uniqueId;

        // If no uniqueId in cookies, return an error
        if (!uniqueId) {
            return res.status(400).send("Invalid user ID");
        }

        // Update user interests
        await User.findOneAndUpdate({ uniqueId }, { interests: req.body.interests });

        // Redirect to questions page
        res.redirect('/questions');
    } catch (error) {
        console.error("Error saving interests:", error);
        res.status(500).send("An error occurred while saving interests");
    }
});

// Page 3: Questions
router.get("/questions", (req, res) => {
    const uniqueId = req.cookies.uniqueId;

    // If no uniqueId in cookies, return an error
    if (!uniqueId) {
        return res.status(400).send("Invalid user ID");
    }

    res.render("questions", { uniqueId });
});

router.post('/questions', async (req, res) => {
    try {
        const { qualities, hobbies, about} = req.body;
        const uniqueId = req.cookies.uniqueId;
        const email = req.cookies.email;
        console.log(uniqueId);
        
        console.log(email);
        if (!uniqueId) {
            return res.status(400).send('Invalid user ID');
        }

        // Update the user record with questions data
        await User.findOneAndUpdate(
            { uniqueId },
            {
                $set: {
                    'questions.qualities': qualities,
                    'questions.hobbies': hobbies,
                    'questions.about': about,
                },
                
            },
            { new: true }
        );

        if (!User) {
            return res.status(404).send('User not found');
        }

        console.log("Sending email to:", email);
        console.log("User uniqueId for email:", uniqueId);


        // Send thank-you email
        sendThankYouEmail(email, uniqueId);

        res.redirect('/thankyou');
    } catch (error) {
        console.error('Error saving questions:', error);
        res.status(500).send('An error occurred while saving questions');
    }
});



// Page 4: Thank You
router.get('/thankyou', async (req, res) => {
    try {
        // Retrieve the uniqueId from cookies
        const uniqueId = req.cookies.uniqueId;

        if (!uniqueId) {
            return res.status(400).send("User ID not found in cookies. Please register again.");
        }

        // Pass the uniqueId to the thank-you page
        res.render('thankyou', { uniqueId });
    } catch (err) {
        console.error('Error loading thank-you page:', err);
        res.status(500).send('An error occurred.');
    }
});

module.exports = router;
