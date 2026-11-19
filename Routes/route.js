const express = require('express')
const router = new express.Router()

const {userRegister} = require ('../Controllers/userController')

router.post('/register',userRegister)


module.exports=router