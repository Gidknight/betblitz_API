const express = require('express')
const router = express.Router()

const {getAllJobs,
    getSingleJob,
    createJob,
    updateJob,
    deleteJob} = require('../controllers/jobs')


router.route('/jobs').get(getAllJobs).post(createJob)
router.route('/job/:id').get(getSingleJob).patch(updateJob).delete(deleteJob)

module.exports = router