// function related to jobs 
const Task = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

const getALLTasks = async (req, res) => {
  const tasks = await Task.find({ createdBy: req.user.userID }).sort('createdAt')
  res.status(StatusCodes.OK).json({ tasks, count: tasks.length })
}

const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      createdBy: req.user.userID,
      status: 'completed'
    }).sort('createdAt');

    res.status(StatusCodes.OK).json({ tasks, count: tasks.length });
  } catch (error) {
    throw new BadRequestError('Could not fetch completed tasks');
  }
};



const getSingleTask = async (req, res) => {
  // we will get the job id from the params and user who created the job from userId we will use destructing 
  const { user: { userID }, params: { id: taskId } } = req
  const task = await Task.findOne({
    _id: taskId, createdBy: userID
  })
  if (!task) {
    throw new NotFoundError(` no job with id ${taskId}`)
  }
  res.status(StatusCodes.OK).json({ task })
}

const createTask = async (req, res) => {
  req.body.createdBy = req.user.userID
  const task = await Task.create(req.body)
  res.status(StatusCodes.CREATED).json({ task })
}

const updateTask = async (req, res) => {
  const { name, status } = req.body
  const { userID } = req.user
  const { id: taskId } = req.params

  //   if (name === '' || status === '') {
  //     throw new BadRequestError('name or status fields cannot be empty')
  //   }
  //   console.log('jobId:', taskId);
  // console.log('userId from token:', userID);

  const taskCheck = await Task.findById(taskId);


  const task = await Task.findOneAndUpdate(
    { _id: taskId, createdBy: userID },
    req.body,
    { new: true, runValidators: true }
  )

  if (!task) {
    throw new NotFoundError(`No job with id ${taskId}`)
  }

  res.status(StatusCodes.OK).json({ task })
}

const deleteTask = async (req, res) => {
  const { id: taskId } = req.params
  const task = await Task.findOneAndDelete({ _id: taskId })
  if (!task) {
    throw new NotFoundError(`not found task with id ${taskId}`)
  }
  res.status(StatusCodes.OK).json({ msg: "task is deleted" })
}

module.exports = {
  getALLTasks,
  getCompletedTasks,
  getSingleTask,
  createTask,
  updateTask,
  deleteTask
}