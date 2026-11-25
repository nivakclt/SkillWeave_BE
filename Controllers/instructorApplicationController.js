const InstructorApplication = require('../Models/instructorApplicationModel')
const instructorApplication = require('../Models/instructorApplicationModel')
const users = require('../Models/userModel')

// submit instructor application
const submitInstructorApplication = async(req,res)=>{
    try{
        const userId = req.user.userId

        // find the logged in user
        const user = await users.findById(userId)

        if(!user){
            return res.status(404).json('User Not Found')
        }

        // Only students can apply
        if(user.role !=='student'){
            return res.status(403).json('Only students can apply')
        }

        // checking existing application
        const existingApplication = await InstructorApplication.findOne({
            applicant:userId
        })

        if(existingApplication){
            return res.status(409).json("You have already submitted an instructor Application")
        }
        // Creating application
        const application = new InstructorApplication({
            applicant: userId,
            teachingDomain: req.body.teachingDomain,
            qualifications: req.body.qualifications,
            experience: req.body.experience,
            portfolioUrl: req.body.portfolioUrl,
            teachingIntroduction: req.body.teachingIntroduction
        })
        await application.save()

        // Update User Application Status
        user.instructorStatus = 'pending'
        await user.save()
        res.status(201).json({message:"Instructor application submitted successfully",application})
    }
    catch(error){
        console.log('Instructor Application Error:',error)
        res.status(500).json('Internal Server Error')
    }
}

// Get logged-in users application
const getMyInstructorApplication=async(req,res)=>{
    try {
        const application = await InstructorApplication.findOne({
            applicant:req.user.userId
        })
        if(!application){
            return res.status(404).json('No instructor application Found')
        }
        res.status(200).json({})
    } catch (error) {
        
    }
}