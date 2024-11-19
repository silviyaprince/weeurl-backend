import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dataBaseConnection } from "./db.js";
import  {userRouter}  from "./routes/user.js";
import { urlRouter } from "./routes/shorturl.js";
import { countRouter } from "./routes/count.js";

import { isAuthenticated } from "./controllers/auth.js";

dotenv.config();

const app=express();
const PORT=process.env.PORT;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

//conectind the db

dataBaseConnection();

app.get("/",(req,res)=>{
    res.send({data:"working"})
})

app.use("/user",userRouter)
app.use("/url",urlRouter)
app.use("/urlcount",countRouter)
app.listen(PORT,()=>console.log(`server started on localhost ${PORT}`))