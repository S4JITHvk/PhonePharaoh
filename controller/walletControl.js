const wallet =require('../models/wallet')
const User=require('../models/user')


const wallet_get=async (req,res)=>{
    try{
        const username=req.session.name
        const email=req.session.email
        const user=await User.findOne({email:email})
        const userId=user._id
        const Wallet=await wallet.findOne({userId:userId})
        console.log(Wallet)     
        res.render('./user/wallet',{username,Wallet})
    }catch(error){
        console.log(error)
    }
}


module.exports={
    wallet_get
}