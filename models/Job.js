const mongoose = require('mongoose')
const TaskSchema =  new mongoose.Schema({
    name : {
        type :String,
        // required:[true,"please provide  name  "],
    },
    status : {
        type :String,
        // required:[true,"please provide status "],
        enum: ['completed', 'uncompleted'], // only these two values allowed
        default: 'uncompleted'
    },
    // status : {
    //     type :String,
    //     enum: ['interview', 'declined', 'pending'],
    //     default:"pending"
    // },
    createdBy:{
        type:mongoose.Types.ObjectId,   // we wiil return user who created this job
        ref:'USER',
        required:[true,"please provide user"]
    }
},{timestamps:true})  // to add createdAt and updatedAt for each document

module.exports = mongoose.model("Task", TaskSchema)