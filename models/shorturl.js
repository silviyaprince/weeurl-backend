import mongoose from "mongoose";

const urlSchema=new mongoose.Schema({
    longUrl:{
        type:String,
        required:true,
        
    },
    shortUrl:{
        type:String,
        unique:true,
       
    },
   clickCount:{
        type:Number,
        default:0
        
    },
  
},

{
    collection:"weeurl",
})

const Url=mongoose.model("url",urlSchema,)


export {Url}