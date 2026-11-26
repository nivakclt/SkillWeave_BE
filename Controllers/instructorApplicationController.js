const InstructorApplication = require('../Models/instructorApplicationModel')
const InstructorAssessment = require('../Models/instructorAssessmentModel')
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
        res.status(200).json({message:'Application Fetched Successfully',application})
    } catch (err) {
        console.log('Fetch Application Error:',err)
        res.status(500).json('Internal Server Error')
    }
}
module.exports = {submitInstructorApplication,getMyInstructorApplication}

// Get all instructor applications(Admin)
const getAllInstructorApplications = async(req,res)=>{
    try {
        const applications = await InstructorApplication.find()
        .populate(`applicant`,`name email`).sort({createdAt:-1})
        res.status(200).json({message:'Applications fetched successfully',applications})
    } catch (error) {
        console.log('Fetch All Applications Error:',error)
        res.status(500).json('Internal Server Error')
    }
} 
// Approve or reject instructor application (Admin)
const reviewInstructorApplication = async (req, res) => {
    try {
        const { applicationId } = req.params
        const { status, adminFeedback, teachingDemoApproved } = req.body

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json('Invalid application status')
        }

        if (
            adminFeedback !== undefined &&
            typeof adminFeedback !== 'string'
        ) {
            return res.status(400).json('Invalid feedback')
        }

        if (status === 'rejected' && !adminFeedback?.trim()) {
            return res.status(400).json('Please provide rejection feedback')
        }

        const application = await InstructorApplication.findById(applicationId)

        if (!application) {
            return res.status(404).json('Application not found')
        }

        if (application.status !== 'pending') {
            return res.status(409).json('Application has already been reviewed')
        }

        const applicant = await users.findById(application.applicant)

        if (!applicant) {
            return res.status(404).json('Application account not found')
        }

        if (status === 'approved') {
            const assessment = await InstructorAssessment.findOne({
                application: application._id,
                status: 'submitted'
            })

            if (!assessment || assessment.score == null || assessment.score < 80) {
                return res.status(400).json('Assessment score must be at least 80')
            }

            if (!application.teachingDemoUrl) {
                return res.status(400).json('Teaching demonstration is required')
            }

            if (teachingDemoApproved !== true) {
                return res.status(400).json('Admin must approve the teaching demonstration')
            }

            application.teachingDemoApproved = true
            application.teachingDemoReviewedAt = new Date()
            applicant.role = 'instructor'
        }

        applicant.instructorStatus = status

        application.status = status
        application.adminFeedback = adminFeedback?.trim() || ''
        application.reviewedBy = req.user.userId
        application.reviewedAt = new Date()

        await applicant.save()
        await application.save()

        return res.status(200).json({
            message: `Instructor application ${status} successfully`,
            application
        })

    } catch (error) {
        console.log('Review Application Error:', error)

        if (error.name === 'CastError') {
            return res.status(400).json('Invalid application ID')
        }

        return res.status(500).json('Internal Server Error')
    }
}

const submitTeachingDemo = async (req, res) => {
    try {
        const { teachingDemoUrl } = req.body

        if (
            typeof teachingDemoUrl !== 'string' ||
            !teachingDemoUrl.trim()
        ) {
            return res.status(400).json('Teaching demo URL is required')
        }

        let url

        try {
            url = new URL(teachingDemoUrl.trim())
        } catch {
            return res.status(400).json('Invalid URL')
        }

        if (url.protocol !== 'https:') {
            return res.status(400).json('Use a valid HTTPS URL')
        }

        const application = await InstructorApplication.findOneAndUpdate(
            {
                applicant: req.user.userId,
                status: 'pending'
            },
            {
                teachingDemoUrl: url.toString(),
                teachingDemoSubmittedAt: new Date()
            },
            { new: true }
        )

        if (!application) {
            return res.status(404).json('Pending application not found')
        }

        return res.status(200).json({
            message: 'Teaching demo submitted successfully',
            teachingDemoUrl: application.teachingDemoUrl
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal Server Error')
    }
}
module.exports = {submitInstructorApplication,getMyInstructorApplication,
    getAllInstructorApplications,reviewInstructorApplication,submitTeachingDemo
}