// role-based authorization middleware
const roleMiddleware = (...allowedRoles)=>{
    return (req,res,next)=>{
        try{
            const userRole = req.user.role
            if(!allowedRoles.includes(userRole)){
                return res.status(403).json('Aceess Forbidden.You dont have Permission')
            }
            next()
        }
        catch(err){
            console.log(err)
            res.status(500).json("Internal Server Error")
        }
    }
}
module.exports = roleMiddleware