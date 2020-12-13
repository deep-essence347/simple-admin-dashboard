var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    isAdmin: Boolean,
    isVerified: Boolean
    // profileImage: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = new mongoose.model('User',userSchema);