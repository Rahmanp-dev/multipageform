const express = require("express");
const { createServer } = require("http");
const app = require("../app"); // Path to your Express app

module.exports = (req, res) => {
    const server = createServer(app);
    server.emit("request", req, res);
};
