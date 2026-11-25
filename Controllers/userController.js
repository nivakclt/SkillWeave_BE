const users = require('../Models/userModel')
const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

const crypto = require('crypto')
const transporter = require('../config/emailconfig')

// register
const userRegister = async (req,res)=>{
    try{
        const{ name, email, password}= req.body
        // checking whether all feilds are provided
        if(!name || !email ||!password ){
            return res.status(400).json("All Feilds are required")
        }
        // checking whether user already exists
        const existingUser = await users.findOne({email})
        if(existingUser){
            return res.status(409).json("User Already Exists")
        }
        // encrypting password
        const hashedPassword = await bcrypt.hash(password,10)
        // craeting new user
        const newUser = new users({
            name , email , password:hashedPassword , role:'student'
        })
        // saving user to db
        await newUser.save()
        res.status(201).json({
            message:"Registration Successfull"
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json("Internal Server Error")
    }
}

// login
const userLogin = async(req,res)=>{
    try{
        const {email,password}=req.body
        //checking whether all feilds are provided
        if(!email ||!password){
            return res.status(400).json("All Feilds are Required")
        }

        // checking whether user exists
        const existingUser = await users.findOne({email})
        if(!existingUser){
            return res.status(404).json("User Not Found")
        }
        // comparing password
        const isPasswordMatch = await bcrypt.compare(password,existingUser.password)
        if(!isPasswordMatch){
            return res.status(401).json("Invalid Password or Email")
        }
        // generating JWT token
        const token = jwt.sign({userId: existingUser._id,role:existingUser.role},
            process.env.JWT_SECRET,{expiresIn:'1d'}
        )
        // sending response
        res.status(200).json({message:"Login Successfull",token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role
            }
        })
    }
    catch(err){
        console.log(err)
        res.status(500).json("Internal Server Error")

    }
}

// getUserProfile
const getUserProfile = async (req, res) => {
    try {
        const user = await users.findById(req.user.userId).select('-password')
        if (!user) {
            return res.status(404).json("User Not Found")
        }
        res.status(200).json({
            message: "Profile Fetched Successfully",
            user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json("Internal Server Error")
    }
}

// forgotPassword
const forgotPassword = async(req,res)=>{
    try{
        const {email}= req.body
        const user = await users.findOne({email})
        if(!user){
            return res.status(404).json("User Not Found")
        }
        // Generate Reset Token
        const token = crypto.randomBytes(32).toString('hex')

        // Hash Token before storing it in db
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
        await user.save()

        // send reset email
        const resetLink = `http://localhost:5173/reset-password/${token}`
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SkillWeave Password Reset',
            html: `<h2>Reset Your Password</h2>
                   <p>Click below to reset your password:</p>
                   <a href="${resetLink}">Reset Password</a>
                   <p>This link expires in 15 minutes.</p>`
        })
        res.status(200).json("Password Reset Link Sent Successfully")
    }
    catch(err){
        console.log(err)
        return res.status(500).json('Interval server Error')
    }
}

//resetPassword
const resetPassword = async(req,res)=>{
    try{
        const {token} = req.params
        const {password}=req.body

        // Validate password
        if(!password || password.length < 8){
            return res.status(400).json("Password must be atleast 8 characters")
        }

        // Hashed the recoeved token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        // Find User with valid token
        const user = await users.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordExpires:{$gt:Date.now()}
        })
        if (!user) {
            return res.status(400).json("Invalid or Expired Token")
        }
        // Hash new password
        user.password = await bcrypt.hash(password, 10)

        // Clear reset token
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()
        res.status(200).json("Password Reset Successfully")
    }
    catch(err){
        console.log(err)
        return res.status(500).json('Internal Server Error')
    }
}

module.exports={userRegister,userLogin,getUserProfile,forgotPassword,resetPassword}