const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    company:{
        type: String,
        required: [true, 'company name must be provided'],
        maxlength: 50,
    },
    position:{
        type: String,
        required: [true, 'the job position must be specified'],
        maxlength: 100,
    },
    status:{
        type: String,
        enum:['pending', 'interview', 'declined'],
        default: 'pending',
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'please provide the user']
    }
    },
    {timestamps: true}
)


module.exports = mongoose.model('Job', JobSchema)