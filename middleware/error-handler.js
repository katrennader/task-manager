const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode : err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR, 
    err :err.message || `something went wrong please try again`
  }
  // handle validation error
  if (err.name === 'ValidationError'){
    customError.msg = Object.values(err.errors).map((item) => item.message).join(',')
    customError.statusCode = 400
  }
  // handle duplciation of email when err code =11000
  if (err.code && err.code === 11000){
     // object keys return to us which field is dupicated 
    customError.msg = `duplicate value entered for ${Object.keys(err.keyValue)} please provide another value`
    customError.statusCode = 400 // bad request 
  }
  //  handle cast error (id is not valid in synatx itself )
  if (err.name === 'CastError'){
    customError.msg = `No item found with id : ${err.value}`
    customError.statusCode = 404
  }

  return res.status(customError.statusCode).json({ msg : customError.msg })
}

module.exports = errorHandlerMiddleware
