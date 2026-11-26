const express = require('express')
const router = new express.Router()

const {userRegister,userLogin,getUserProfile,forgotPassword,resetPassword} = require ('../Controllers/userController')
const authMiddleware = require('../Middlewares/authMiddleware')
const roleMiddleware = require('../Middlewares/roleMiddleware')
const {submitInstructorApplication,getMyInstructorApplication
    ,getAllInstructorApplications,reviewInstructorApplication,submitTeachingDemo
}=require('../Controllers/instructorApplicationController')
const {createAssessment,getMyAssessment, submitAssessment}=require('../Controllers/instructorAssessmentController')

const { sendContactMessage } = require('../Controllers/contactController')
// protected profile route
router.get('/profile',authMiddleware,getUserProfile)

router.post('/register',userRegister)
router.post('/login',userLogin)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token',resetPassword)
router.post('/contact',sendContactMessage)

// Instructor application routes
router.post('/instructor/apply',authMiddleware,submitInstructorApplication)
router.get('/instructor/my-application',authMiddleware,getMyInstructorApplication)

// role based access
router.get('/student-dashboard', authMiddleware, roleMiddleware('student'), (req, res) => {
    res.status(200).json("Welcome to Student Dashboard")
})
router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.status(200).json("Welcome to Admin Dashboard")
})
// Admin :view all instructor application
router.get('/admin/instructor-applications',authMiddleware,roleMiddleware('admin'),getAllInstructorApplications)
// Admin:approve or reject an application
router.patch('/admin/instructor-application/:applicationId',authMiddleware,roleMiddleware('admin'),reviewInstructorApplication)

router.post('/admin/create-assessment',authMiddleware,roleMiddleware('admin'),createAssessment)
router.get('/instructor/my-assessment',authMiddleware,getMyAssessment)
router.post('/instructor/submit-assessment',authMiddleware,submitAssessment)
router.post('/instructor/submit-demo',authMiddleware,submitTeachingDemo)
module.exports=router