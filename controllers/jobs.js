const Job = require('../models/Job')
const { StatusCodes } = require ('http-status-codes')
const { BadRequestError, NotFoundError } = require ('../errors')


const getAllJobs = async (req,res)=>{
    const jobs = await Job.find({ createdBy: req.user.userID}).sort('CreatedAt')
    res.status(StatusCodes.OK).json({jobs, numHits: jobs.length})
}

const getSingleJob = async (req,res)=>{

    const {
        user: {userID},
        params: {id:jobID}
    } = req

    const job = await Job.findOne({
        _id:jobID,
        createdBy: userID
    })
    if (!job) {
        throw new NotFoundError(`no job with id: ${jobID} found`)
    }
    res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req,res) =>{
    req.body.createdBy = req.user.userID
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({ job })    
    
}

const updateJob = async (req,res) =>{
    const {
        params: { id:jobID},
        body: {company, position, status},
        user: {userID}
    } = req

    if(company === '' || position ==='' || status ===''){
        throw new BadRequestError('company or position or status fields cannot be empty')
    }

    const job = await Job.findOneAndUpdate(
        {_id:jobID, createdBy: userID},
        req.body,
        {new:true, runValidators: true}
        )

    if(!job){
        throw new NotFoundError(`no job with id: ${jobID} found`)
    }
    res.status(StatusCodes.OK).json({job})
}


const deleteJob = async (req,res) =>{
    const {
        params:{ id:jobID},
        user: { userID}
    } = req

    const job = await findOneAndDelete({_id:jobID, createdBy:userID})
    if(!job){
        throw new NotFoundError(`no job with id: ${jobID} found`)
    }
    res.status(StatusCodes.OK).send(`done`)
}


module.exports = {
    getAllJobs,
    getSingleJob,
    createJob,
    updateJob,
    deleteJob
}