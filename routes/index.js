var express = require("express");
var router = express.Router();
const passport = require('passport');
const middlewareObj = require("../middleware");
const middleware = require("../middleware");

const User = require('../model/user');

router.get('/',function(req,res){
    res.render('index');
});

router.get('/register',function(req,res){
    res.render('register');
});

router.post('/register', function(req,res){
    if(req.body.password === req.body.cPassword){
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            isAdmin: false,
            isVerified: false
        });
        User.register(newUser,req.body.password,function(err,user){
            if(!err){
                passport.authenticate('local')(req,res,function(){
                    req.flash('success','Successfully registered the user');
                    res.redirect('/home');
                });
            } else{
                req.flash('error','There was an error. Please try again.');
                console.log(err);
                res.redirect('/register');
            }
        });
    } else{
        req.flash('error','Your Passwords do not match.');
        res.redirect('/register');
    }
});

router.get('/login',function(req,res){
    res.render('login');
});

router.post("/login", function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {
        if (err) {
          req.flash("error", "There was an error. Please try again later.");
          return res.redirect("/login");
        }
        if (!user) {
          req.flash("error", "Invalid Username/Password.");
          return res.redirect("/login");
        }
        req.logIn(user, function (err) {
          if (err) {
            req.flash("error", "There was an error. Please try again later.");
            return res.redirect("/login");
          }
          return res.redirect("/home");
        });
    })(req, res, next);
    
});

router.get('/home', middleware.isLoggedIn, middlewareObj.checkVerification, function(req,res){
    res.render('home');
});

router.get('/logout', middleware.isLoggedIn, function(req,res){
    req.logout();
    res.redirect('/');
});

module.exports = router;