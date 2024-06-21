import express from 'express'
import router from './routes/router.mjs'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';


dotenv.config()

mongoose.connect(process.env.CONNECTION_STRING,{
  dbName:'Rest-API'
})
.then((data)=>
{ 
  console.log("DB Connected");
}).catch((err)=>
{
  console.log(err);
})
const app = express()
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));


app.listen(3000,()=>
{
    console.log("Running on port")
})

app.use('/',router)