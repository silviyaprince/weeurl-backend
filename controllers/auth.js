import jwt from "jsonwebtoken";
import { getUserById } from "./user.js";

const isAuthenticated=async(req,res,next)=>{
    let token;
    if(req.headers){
        try{
            token=await req.headers["x-auth-token"]
            const decode=jwt.verify(token,process.env.SECRET_KEY)
            req.user=await getUserById(decode.id)
            next()

        }catch(err){
            console.log(err)
res.status(500).json({error:"server error"})
        }
    }
    if(!token){
        return res.status(400).json({error:"invalid authorization"})
    }
}

export {isAuthenticated}