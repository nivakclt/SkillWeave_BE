const mongoose = require('mongoose')
const InstructorApplication = require('./instructorApplicationModel')

const assessmentQuestionSchema = new mongoose.Schema({
    questionText:{
        type:String,
        required:true,
        trim:true
    },
    options:{
        type:[String],
        required:true,
        validate:{
        validator:(options)=>options.length ===4,
        message:'Exactly 4 options are required'
        }
    },
    correctAnswer:{
        type:Number,
        required:true,
        min:0,
        max:3
    }
})

const instructorAssessmentSchema = new mongoose.Schema({
    application:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'InstructorApplication',
        required:true,
        unique:true
    },
    teachingDomain:{
        type:String,
        required:true
    },
    questions:{
        type:[assessmentQuestionSchema],
        required:true
    },
    score:{
        type:Number,
        default:null
    },
    status:{
        type:String,
        enum:['pending','submitted'],
        default:'pending'
    },
    submittedAt:{
        type:Date,
        default:null
    }
},{timestamps:true})

const instructorAssessment = mongoose.model('InstructorAssessment',instructorAssessmentSchema)
module.exports = instructorAssessment