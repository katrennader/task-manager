const mongoose = require('mongoose')
const USER = require('../models/User')
const bcrypt = require('bcryptjs')  // to hash user password
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name :{
        type :String,
        required :[true, "please provide a name "],
        trim :true,
        minlength:3,
        mmaxlength:50,
    },
    email :{
        type :String,
        required :[true, "please provide  a valid email "],
        //  in match we give regular expression to check that user give the same syntax of email (***@gmail.com)
        // we can get this expression from any docs or chatgpt
      match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique :true,
    },
    password :{
        type :String,
        required :[true, "please write strong password"],
        minlength:3,
        },

})

// we will create token here using instance of schema 
userSchema.methods.createJwt = function (){
    return jwt.sign({userID : this._id,name : this.name},process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME})
}

// compare function is bukit in function in bcrypt to compare password with hashedpassword
userSchema.methods.comparePassword = async function (userPassword){
    const isMatch = await bcrypt.compare(userPassword, this.password)   // this.password is refer to password that stored in database
    return isMatch
}


// make middleware to to make hash password for every user and save out of controllers 
// pre function take save and function
userSchema.pre('save',async function(next){
const salt = await bcrypt.genSalt(10)
this.password = await bcrypt.hash(this.password,salt)    // this return on document (user )
})

module.exports = mongoose.model('user', userSchema)