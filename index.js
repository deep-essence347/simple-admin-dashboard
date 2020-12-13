require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require("passport-local");

const User = require('./model/user');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public/'));
app.use(bodyParser.urlencoded({extended: true}));

var indexRoutes = require('./routes/index');
var adminRoutes = require('./routes/admin');

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/myWebDB");


app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use("/",indexRoutes);
app.use('/admin',adminRoutes);

app.get('*', function(req,res){
    res.render('404');
});

app.listen(3000, function(){
    console.log('Server has started.');
});