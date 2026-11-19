// loads dotenv file contents into process env by default
require('dotenv').config()
require('./dbConnect/db')

const express=require('express')
const cors=require('cors')

// craeting server instance
const server=express()

// enabling cors in server
server.use(cors())
const router = require('./Routes/route')

// enabling json middleware
server.use(express.json())

// configuring router
server.use(router)

// setting up a port number
const port=process.env.PORT

// start server to listen client request to that port / available server in internet
server.listen(port,()=>{
    console.log(`Server Started at ${port} & waiting for client requests`)
})

// handling global errrors using application level middleware
server.use((err,req,res,next)=>{
    console.log(err)
    res.status(500).json(err)
})
