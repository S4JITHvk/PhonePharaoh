const Coupon=require("../models/coupon")
const { ObjectId } = require("mongodb");
const User=require('../models/user')
const cart=require('../models/Cart')
// Admin coupon management

const add_coupon_get= async (req,res)=>{
    try{
        let coupon=await Coupon.find()
        res.render('./admin/add-coupon',{coupon})
    }catch(error){
        console.log(error)
    }   
}
const edit_coupon = async (req, res) => {
  try {
    const couponId = req.body.couponid;
    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }
    existingCoupon.couponCode = req.body.couponCode;
    existingCoupon.description = req.body.description;
    existingCoupon.minPurchaseAmount = req.body.Minamount;
    existingCoupon.discount= req.body.discount;
    existingCoupon.maxdiscountAmount=req.body.discountprice;
    existingCoupon.expiryDate = req.body.endDate;
    const updatedCoupon = await existingCoupon.save();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const add_coupon = async (req, res) => {
    try {
      const coupon = {
        couponCode: req.body.couponCode,
        description: req.body.description,
        minPurchaseAmount: req.body.Minamount,
        discount: req.body.discount,
        maxdiscountAmount:req.body.discountprice,
        expiryDate: req.body.endDate,
      }; 
      const exist = await Coupon.find({ couponCode: req.body.couponCode }); 
      if (exist.length > 0) {
        res.json("This coupon already exists!!");
      } else {
        const newCoupon = await Coupon.create(coupon);
        if (newCoupon) {    
          res.json({ success: true });
        } else {  
          res.json({ error: "Coupon already exists" });
        }
      }
    } catch (error) {
      console.log(error);
      res.json({ error: "Some error occurred" });
    }
  };
  const deletecoupon=async(req,res)=>{
    try {
        const CouponId = req.params.couponId; 
        await Coupon.findByIdAndDelete(CouponId );
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// User coupons 
const coupon_get=async(req,res)=>{
  try{
   const username=req.session.name
   const coupon=await Coupon.find()
   if(coupon){
    res.render("./user/coupon",{username,coupon})
   }else{
    console.log("no couponns")
   }
  }catch(error){
    console.log(error)
  }
}
const coupon_check = async (req, res) => {
  try {
    const email = req.session.email;
    const couponCode = req.body.couponCode;
    const amount = req.session.totalPrice;
    const amt = parseInt(amount);
    const user = await User.findOne({ email: email });
    const userId = user._id;
    const couponMatch = await Coupon.findOne({ couponCode: couponCode });
    if (couponMatch) {
      let discount = 0;
      const couponUsed = await Coupon.findOne({
        couponCode: couponMatch.couponCode,
        "usedBy.userId": userId,
      });
      if (couponUsed) {
        return res.json({ error: "You have used the coupon once" });
      } else {
        console.log(amt)
        console.log(couponMatch.maxdiscountAmount)
        if (amt >= couponMatch.minPurchaseAmount) {
          console.log(couponMatch.discount)
          discount = (amt * couponMatch.discount / 100);
          console.log(discount,"====")
          if (discount > couponMatch.maxdiscountAmount) {          
            discount = couponMatch.maxdiscountAmount;
            console.log( discount)
        }
          req.session.totalPrice=amt-discount
            req.session.code = couponMatch.couponCode;
            return res.json({ success: true,discount });
          
        } else {
          return res.json({
            error: `Cart should contain a minimum amount of ${couponMatch.minPurchaseAmount}`,
          });
        }
      }
    } else {
      return res.json({
        error: `Coupon code is invalid`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      error: `Invalid Coupon code`,
    });
  }
};


const edit_coupon_get= async(req,res)=>{
  try{
const couponid=req.params.couponId
const coupon=await Coupon.findOne({_id:couponid})
res.json({coupon})
  }catch(error){
    console.log(error)
  }
}



module.exports={
    add_coupon_get,
    add_coupon,
    coupon_get,
    coupon_check ,
    edit_coupon_get,
    edit_coupon,
    deletecoupon
}