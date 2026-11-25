const express = require('express')
const router = new express.Router()

const {userRegister,userLogin,getUserProfile,forgotPassword,resetPassword} = require ('../Controllers/userController')
const authMiddleware = require('../Middlewares/authMiddleware')
const roleMiddleware = require('../Middlewares/roleMiddleware')

const { sendContactMessage } = require('../Controllers/contactController')
// protected profile route
router.get('/profile',authMiddleware,getUserProfile)

router.post('/register',userRegister)
router.post('/login',userLogin)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token',resetPassword)
router.post('/contact',sendContactMessage)

// role based access
router.get('/student-dashboard', authMiddleware, roleMiddleware('student'), (req, res) => {
    res.status(200).json("Welcome to Student Dashboard")
})
router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.status(200).json("Welcome to Admin Dashboard")
})

module.exports=router