var express = require('express');
var path = require('path');

const content = require("./config/conectet");
const securityMiddleware = require('./middlewares/securityMiddleware');
const { errorNotFound, errorHandler } = require('./middlewares/error');
require("dotenv").config();
const cors = require('cors');



var usersRouter = require('./routes/users');
var forgetpassRouter = require('./routes/forgetpass');
var documentsRouter = require('./routes/Documentsrouter');


var app = express();
securityMiddleware(app);

content();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'auth-token'],
  exposedHeaders: ['auth-token']
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/forgetpass', forgetpassRouter);
app.use('/documents', documentsRouter);

// catch 404 and forward to error handler
app.use(errorNotFound);

// error handler
app.use(errorHandler);


module.exports = app;
