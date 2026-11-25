const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    questionText:{
        type:String,
        required:true,
        trim:true
    },
    options:{
        type:[String],
        required:true,
        validate:{
            validator:(option)=>options.length>=2,
            message:'A question must have atleast two options'
        }
    },
    correctAnswer:{
        type:Number,
        required:true,
        min:0
    },
    marks:{
        type:Number,
        default:1,
        min:1
    },
    topic:{
        type:String,
        required:true
    },
    misconceptionTags:{
        type:[String],
        default:[]
    }
})
const quizSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true,
        min:1
    },
    passingScore:{
        type:Number,
        required:true,
        min:1,
        max:100
    },
    questions:{
        type: [questionSchema],
        validate: {
        validator: (questions) => questions.length > 0,
        message: 'A quiz must contain at least one question'
      }
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    status:{
        type:String,
        enum:['draft','published'],
        default:'draft'
    },
},{timestamps:true})

const Quiz = mongoose.model('Quiz',quizSchema)
module.exports = Quiz