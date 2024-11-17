import mongoose from "mongoose";
import jsonwebtoken from "jsonwebtoken";
const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        maxlength:32,
        trim:true,
    },
    lastname:{
        type:String,
        required:true,
        maxlength:32,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
   password:{
        type:String,
        required:true,
       trim:true,
    },
    resetPasswordToken:{
        type:String,

    },
    resetPasswordExpires:{
        type:Date,
    },
    
},

{
    collection:"weeuser",
})

const User=mongoose.model("user",userSchema,)

const generateToken=(id)=>{
    return jsonwebtoken.sign({id},process.env.SECRET_KEY)
}
export {User,generateToken}