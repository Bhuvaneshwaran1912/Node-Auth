const express = require('express');
const cors = require('cors');
const connection = require("./connection");
const protectedRoutes = require('./services/authentication');
const userRoute = require('./Routes/user');
const chatRoute = require('./Routes/chat');
const checkOnlineRoute = require('./Routes/checkOnline');
const jwt = require('jsonwebtoken')

var app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

app.use('/user', userRoute)
app.use('/chat', chatRoute)
app.use('/chatCheckOnline', checkOnlineRoute)

module.exports = app

