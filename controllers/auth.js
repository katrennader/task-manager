// functions related to authentication (login or register )
const USER = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {BadRequestError,UnauthenticatedError} = require('../errors')
const register = async (req, res)=>{
    const user = await USER.create({...req.body}) 
    const token = user.createJwt()
    res.status(StatusCodes.CREATED).json({user:{name:user.name},token})
}



const login  = async (req, res)=>{
    const {email , password} = req.body
    // check first if user enter allfields
    if (!email  || !password){
        throw new BadRequestError("please provide email and password")
    }
    const user = await USER.findOne({email})
   // move on each data check if we have user with this email 
    if (!user){
    throw new UnauthenticatedError("user is unauthenticated for this resource")
    }
    // we find user with this email so we want to check password to make him login to system
    const isPasswordcorrect =  await user.comparePassword(password)
    if(!isPasswordcorrect){
     throw new UnauthenticatedError("user is unauthenticated for this resource")
    }
      // all user data are correct so we will send resposnse with token
        const token = user.createJwt()
    res.status(StatusCodes.OK).json({user :{name:user.name}, token})
    
}

module.exports = {
    register,
    login,
}