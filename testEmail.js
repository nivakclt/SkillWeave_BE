require('dotenv').config()

const transporter = require('./config/emailconfig')

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Email Server is Ready")
    }
})