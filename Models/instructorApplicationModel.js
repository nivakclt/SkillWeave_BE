const mongoose = require('mongoose')
const instructorApplicationSchema = new mongoose.Schema({
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    teachingDomain:{
        type:String,
        required:true,
        enum:[
        'Software & Web Development',
        'Cybersecurity',
        'Networking & Infrastructure',
        'Cloud Computing & DevOps',
        'Data Science & AI',
        'UI/UX Design',
        'Database Management',
        'Software Testing & QA'
        ]
    },
    qualifications:{
        type:String,
        required:true,
        trim:true
    },
    experience:{
        type:String,
        required:true,
        trim:true
    },
    portfolioUrl:{
        type:String,
        trim:true,
        default:''
    },
    teachingIntroduction:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending'
    },
    adminFeedback:{
        type:String,
        default:''
    },
    reviewedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        default:null
    },
    reviewedAt:{
        type:Date,
        default:null
    }
},{timestamps:true})

const InstructorApplication = mongoose.model('InstructorApplication',instructorApplicationSchema)
module.exports = InstructorApplication