var express = require("express");
var router = express.Router();
const passport = require("passport");
const middleware = require("../middleware");

const User = require("../model/user");

router.get("/", function (req, res) {
  res.render("admin/index");
});

router.post("/login", function (req, res, next) {
  if (req.body.adminKey === process.env.ADMIN_KEY) {
    passport.authenticate("local", function (err, user, info) {
      if (err) {
        req.flash("error", "There was an error. Please try again later.");
        return res.redirect("/admin");
      }
      if (!user) {
        req.flash("error", "Invalid Username/Password.");
        return res.redirect("/admin");
      }
      req.logIn(user, function (err) {
          if (err) {
            req.flash("error", "There was an error. Please try again later.");
            return res.redirect("/admin");
          }
          return res.redirect("/admin/home");
      });
    })(req, res, next);
  } else {
    req.flash("error", "Invalid Admin Key.");
    res.redirect("/admin");
  }
});

router.get('/register',function(req,res){
    res.render('admin/register');
});

router.post('/register',function(req,res){
    if(req.body.adminKey === process.env.ADMIN_KEY){
        if(req.body.password === req.body.cPassword){
            const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                email: req.body.email,
                isAdmin: true,
                isVerified: true
            });
            User.register(newUser,req.body.password,function(err,user){
                if(!err){
                    passport.authenticate('local')(req,res,function(){
                        req.flash('success','Successfully registered the user.');
                        res.redirect('/admin/home');
                    });
                } else{
                    req.flash('error','There was an error. Please try again.');
                    res.redirect('/admin/register');
                }
            });
        } else{
            req.flash('error','Your Passwords do not match.');
            res.redirect('/admin/register');
        }
    } else{
        req.flash('error','Invalid Admin Key.');
        res.redirect('/admin/register');
    }
});

router.get("/home", middleware.adminCheck, function (req, res) {
  User.find({}, function(err,users){
    var report = {
      userLength: 'unknown',
      adminLength: 'unknown',
      pendingVerf: 'unknown'
    }
    if(err){
      req.flash('error','There was an error. Please try logging in again.');
    } else{
      report.userLength = users.filter(user => user.isAdmin === false).length;
      report.adminLength = users.filter(user => user.isAdmin === true).length;
      report.pendingVerf = users.filter(user => user.isVerified === false).length;
    }
    res.render("admin/home",{report: report});
  });
});

router.get('/general/:userType',middleware.adminCheck,function(req,res){
  var isAdmin = false;
  if(req.params.userType === 'admins'){
    isAdmin = true;
  }
  User.find({isAdmin: isAdmin},function(err,users){
    if(err){
      req.flash('error', 'An error occurred while retrieving users. Try reloading again.');
    }
    res.render('admin/general',{users: users,isAdmin: isAdmin});
  });
});

router.get('/edit/id=:id', middleware.adminCheck,function(req,res){
  User.findOne({_id: req.params.id}, function(err,foundUser){
    if(!err){
      if(foundUser){
        res.render('admin/editUser',{user: foundUser});
      } else{
        req.flash('error','User not found.');
        res.redirect('back');
      }
    } else{
      res.flash('error','An error occurred. Please try again.');
      res.redirect('back');
    }
  });
});

router.post('/edit/id=:id', middleware.adminCheck,function(req,res){
  if(req.body.adminKey === process.env.ADMIN_KEY){
    User.findOne({_id: req.params.id}, function(err,foundUser){
      if(!err){
        if(foundUser){
          foundUser.firstName = req.body.firstName;
          foundUser.lastName = req.body.lastName;
          foundUser.username = req.body.username;
          foundUser.save(function(err){
            if(!err){
              req.flash('success','Successfully updated the data.');
              res.redirect('back');
            } else{
              req.flash('error','An error occurred while saving the data. Please try again.');
              res.redirect('back');
            }
          });
        } else{
          req.flash('error','User not found.');
          res.redirect('back');
        }
      } else{
        res.flash('error','An error occurred. Please try again.');
        res.redirect('back');
      }
    });
  } else {
    req.flash('error','Invalid Admin Key.');
    res.redirect('back');
  }
});

router.post('/verify/:id',middleware.adminCheck,function(req,res){
  if(req.body.adminKey === process.env.ADMIN_KEY){
    User.findOne({_id: req.params.id},function(err,foundUser){
      if(!err) {
        if(foundUser){
          foundUser.isVerified = !foundUser.isVerified;
          foundUser.save(function(err){
            if(!err){
              req.flash('success','Successfully toggled verification.');
              res.redirect('back')
            } else{
              req.flash('error','There was an error while toggling the user\'s verification. Please try again.');
              res.redirect('back');
            }
          });
        } else{
          req.flash('error','User not found.');
          res.redirect('back');
        }
      } else{
        req.flash('error','There was an error while toggling the user\'s verification. Please try again.');
        res.redirect('back');
      }
    });  
  } else {
    req.flash('error','Invalid Admin Key.');
    res.redirect('back');
  }
});

router.post('/remove/:id',middleware.adminCheck,function(req,res){
  if(req.body.adminKey === process.env.ADMIN_KEY){
    User.findByIdAndRemove(req.params.id,function(err){
      if(!err){
          req.flash('success','The user has been removed.');
      } else{
        req.flash('error','There was an error while removing the user.');
      }
      res.redirect('back');
    });
  } else {
    req.flash('error','Invalid Admin Key.');
    res.redirect('back');
  }
});

router.get("/logout", middleware.isLoggedIn, function (req, res) {
  req.logout();
  res.redirect("/admin");
});

module.exports = router;
