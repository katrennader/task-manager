const express = require('express')
const router = express.Router()
const { getALLTasks,
    getCompletedTasks,
    getSingleTask,
    createTask,
    updateTask,
    deleteTask } = require('../controllers/jobs')

router.route('/').get(getALLTasks).post(createTask)
router.route('/completed').get(getCompletedTasks)
router.route('/:id').get(getSingleTask).patch(updateTask).delete(deleteTask)

module.exports = router