const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const path = require("path");

const app = express();

// Set the view engine to EJS and define the directory for views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Use body-parser middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure cookie parser (no session management here)
app.use(cookieParser("your-secret-key"));

// Connect to MongoDB Atlas
const dbURI = process.env.MONGODB_URI || "mongodb+srv://yudiapp:yudiapp2024@app.th91t.mongodb.net/?retryWrites=true&w=majority&appName=APP";
mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("Failed to connect to MongoDB Atlas:", err.message));

// Import and use routes
const routes = require("./routes"); // Ensure your routes are correctly implemented in the routes/index.js file
app.use("/", routes);

// Set port and listen
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on port ${port}`);
});

// Handle uncaught errors and rejections
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});
