const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String, // Added phone
    gender: String,
    college: String, // Added college
    collegeId: String, // Added college ID
    degree: String, // Added degree
    age: Number,
    interests: Map, // Stores main and sub-interests as key-value pairs
    questions: {
        qualities: String,
        hobbies: String,
        about: String,
    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
