const users = require('../Models/userModel')
const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

// register
const userRegister = async (req,res)=>{
    try{
        const{ name, email, password, role}= req.body
        // checking whether all feilds are provided
        if(!name || !email ||!password ){
            return res.status(400).json("All Feilds are required")
        }
        // checking whether user already exists
        const existingUser = await users.findOne({email})
        if(existingUser){
            return res.status(409).json("User Already Exists")
        }
        // Validating user role
        if(role && !['student','instructor'].includes(role)){
            return res.status(400).json("Invalid role")
        }
        // encrypting password
        const hashedPassword = await bcrypt.hash(password,10)
        // craeting new user
        const newUser = new users({
            name , email , password:hashedPassword , role:role || 'student'
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


module.exports={userRegister,userLogin}