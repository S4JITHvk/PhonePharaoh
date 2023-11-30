const OTP=require("../models/otp");
const generateOTP = require("../util/otpgenerator");
const sendEmail=require("../util/email");
const bcrypt=require("bcrypt");
const {AUTH_EMAIL}=process.env;
// const hashData=require("../util/hashData")
const user = require("../models/user")
const validation=require("../auth/mailvalidation")
const Products=require("../models/product")
const Brands=require("../models/brand")


const sendOTP=async (email)=>{
    try{
        if(!(email)){
            throw Error("provide values for email,subject,message")
        }
        await OTP.deleteOne({email})
        const generatedOTP=await generateOTP();
        const mailOptions={
            from:AUTH_EMAIL,
            to:email,
            subject:"Verify the email using this otp",
            html:`<p>Hello new user use the this otp to verify your email to continue </p><p style="color:tomato;font-size:25px;letter-spacing:2px;">
            <b>${generatedOTP}</b></p><p>OTP will expire in<b> 10 minute(s)</b>.</p>`
        }
        await sendEmail(mailOptions);
        const hashedData=await bcrypt.hash(generatedOTP,10);
        function addMinutesToDate(date, minutes) {
            return new Date(date.getTime() + minutes * 60000); 
          }
        const currentDate =new Date();
        const newDate = addMinutesToDate(currentDate, 10);
        const newOTP= await new OTP({
            email,
            otp:hashedData,
            createdAt:Date.now(),
            expireAt:newDate,
        })
        const createdOTPrecord=await newOTP.save()
        return createdOTPrecord
    }catch(err){
        throw err;
    }
}


// OTP VERIFICATON
const otppage_get=(req,res)=>{
    res.render("./user/otpPage",{title:"otp",errmsg:req.flash("errmsg")});
}
const OtpConfirmation = async (req,res) => {
    if(req.session.forgot){      
    try{
        const email=req.session.email
        console.log("forgot confirmation :",email);
        const Otp= await OTP.findOne({email:email})

        if(Date.now()>Otp.expireAt){
            await OTP.deleteOne({data});

        }else{
            const hashed=Otp.otp
            const match=await bcrypt.compare(req.body.code,hashed);
            if(match){
                req.session.forgot=false;
                req.flash("errmsg", "Enter new Password!")
                console.log("exproting:",email)
                res.render("./user/reset-pass",{email,errmsg:req.flash("errmsg")});
            }
            else{
                console.log("no match");
                req.session.userdata="";
                req.flash("errmsg","Invalid OTP")
                req.session.errmsg="Invalid OTP"
                res.redirect("/user/otp")
            }
        }
    }catch(err){
        console.log(err);
        req.session.errmsg="Email not found";
    }
    }
    else if(req.session.signotp){
        console.log(req.body)
        try{
            const data =req.session.data;
           
            const dataplus = {
                userName: data.userName,
                email: data.email,
                password: data.password,
                ISactive: true,
                timeStamp: Date.now()
            }
            const Otp= await OTP.findOne({email:data.email})
           
            if(Date.now()>Otp.expiredAt){
                await OTP.deleteOne({email});
            }else{
                const hashed=Otp.otp
                const match=await bcrypt.compare(req.body.code,hashed);
               
                if(match){
                    const result=await user.insertMany([dataplus])
                    req.session.signotp=false
                   
                    req.flash("successmsg", "Successfully Register ! now you can log in.")
                    res.redirect("/login")
    
                }
                else{
                    req.session.errmsg="Invalid OTP"
                    req.flash("errmsg","Invalid OTP")
                    res.redirect("/user/otp")
                }
            }
             
        }catch(err){
            console.log(err);
            res.redirect("/user/otp")
        }
    }
}
// OTP SENDER

const otpSender = async(req,res)=>{
    if(req.session.signotp || req.session.forgot){
        try{
            console.log(req.session.email);
           
            const email=req.session.email;
          
            const createdOTP=await sendOTP(email)
            req.session.email=email;
   
            req.flash("errmsg","Verify with your otp send to your Email!")
            res.status(200).redirect("/user/otp")
        }catch(err){
            console.log(err);
            req.session.errmsg="Sorry at this momment we can't sent otp";
          
            if(req.session.forgot){
                res.redirect("/user/forget-pass")
            }
            res.redirect("/user/signup");
        }
    }
}
module.exports={
    sendOTP,
    otpSender,
    OtpConfirmation,
    otppage_get,
}