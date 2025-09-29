// here in auth middleware we want to verify the token come from frontend
// we will apply it on all jobs routes
const jwt = require('jsonwebtoken')
const UnauthenticatedError = require('../errors')
const USER = require('../models/User')

const auth = async (req,res,next)=>{
    const authHeader = req.headers.authorization 
    if (!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError('user is unathenticated')
    }
    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token , process.env.JWT_SECRET)
        // attach user to jobs route
        req.user = {userID :payload.userID, name :payload.name}
        next()
    } catch (error) {
    throw new UnauthenticatedError('user is unathenticated')

    }
}
module.exports = auth 
