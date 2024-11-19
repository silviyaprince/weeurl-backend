import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
const urlSchema=new mongoose.Schema({
    longUrl:{
        type:String,
        required:true,
        
    },
    shortUrl:{
        type:String,
        unique:true,
       
    },
    date:{
        type:String,
        required:true,
    },
   clickCount:{
        type:Number,
        default:0
        
    },
    user:{
        type:ObjectId,
        ref:"user",
        required:true,
    }
},

{
    collection:"weeurl",
})

const Url=mongoose.model("url",urlSchema,)


export {Url}