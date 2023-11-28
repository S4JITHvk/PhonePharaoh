require('dotenv').config(); 
const express=require('express')
const app=express()
const path=require('path')
const session=require('express-session')
const nocache = require('nocache');
const {v4: uuidv4 }= require("uuid");
const users = require("./routes/userroute")
const admin = require("./routes/adminroute")
require('./config/DBconnection')
const flash=require("connect-flash")
const PORT=process.env.PORT || 4000
const multer=require("multer")
const cron=require('./util/cron')
// view engine
app.set("view engine","ejs")

// request parse
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// static
app.use("/static",express.static(path.join(__dirname,"public")))
// nocache
app.use(nocache());

//session setup
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
  })
);


app.use(flash());


app.use('/',users)
app.use('/admin',admin)

// Server Runnning
app.listen(PORT,()=>{
    console.log(`server running on :http://localhost:${PORT}`);
})




