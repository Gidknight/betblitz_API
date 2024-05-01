const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const registrationPage = async (req,res)=>{
   
        const user = await User.create({...req.body})
        const token = user.createJWT()
        res.status(StatusCodes.CREATED).json({user:{name:user.name}, })
    
    
}

const login = async(req,res)=>{
    const {email, password} = req.body

    if(!email || !password){
        throw new BadRequestError(`please provide email and password`)
    }
    const user = await User.findOne({email})
    if(!user){
        throw new UnauthenticatedError(`Invalid Credentials`)
    }
    const isCorrectPassword = await user.comparePassword(password)
    if(!isCorrectPassword){
        throw new UnauthenticatedError(`Invalid Credentials`)
    }
    // password comparison
    const token = user.createJWT()
    res.status(StatusCodes.OK).json({user:{name: user.name}, token })
}

const getAllUsers = async (req,res)=>{
    try{
        const user = await User.find({})
        res.status(StatusCodes.ACCEPTED).json({user})
    }catch(error){
        res.status(StatusCodes.BAD_REQUEST).json(error)
    }
}


module.exports = {
    registrationPage,
    login,
    getAllUsers,
}