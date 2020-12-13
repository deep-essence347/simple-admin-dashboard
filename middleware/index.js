var User = require("../model/user");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    req.flash('error','You are not logged in. Please login to continue.');
    res.redirect("/login");
  }
};

middlewareObj.adminCheck = function(req,res,next){
  if(req.isAuthenticated()){
    if(req.user.isAdmin){
      return next();
    } else{
      req.flash('error','You do not have the privileges of an admin.');
      req.logout();
      res.redirect('/*');
    }
  } else {
    req.flash('error','You are not logged in. Please login to continue.');
    res.redirect("/admin");
  }
};

middlewareObj.checkVerification =function(req,res,next) {
  if(req.user.isVerified){
    return next();
  } else {
    req.flash('error','You cannot have the access to your account unless you are verified.');
    req.logout();
    res.redirect('/*');
  }
};

module.exports = middlewareObj;
