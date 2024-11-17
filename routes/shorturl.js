import express from "express";
import { Url } from "../models/shorturl.js";
const router = express.Router();

router.post("/create",(req,res)=>{
    let shortUrl=new Url({
        longUrl:req.body.longurl,
        shortUrl:generateUrl()
    })

    shortUrl.save((err,data)=>{
        if(err) throw err;
        res.redirect('/')

    })
})


router.get("/:urlId",(req,res)=>{
    Url.findOne({shortUrl:req.params.urlId},function(err,data){
        if(err)throw err
        Url.findByIdAndUpdate({_id:data.id},{$inc:{clickCount:1}},function(err,data){
            if(err)throw err;
            res.redirect(data.longUrl)
        })
        
    })
})

function generateUrl(){
    var randomResult="";
    var characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var charactersLength=characters.length

    for(var i=0;i<5;i++){
        randomResult+=characters.charAt(Math.floor(Math.random()*charactersLength))
    }
}

export const urlRouter = router;