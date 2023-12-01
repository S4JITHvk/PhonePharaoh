const express=require("express");
const session = require("express-session");
const user=express.Router()
const userControl=require("../controller/usercontrol");
const otpControl=require("../controller/otpcontrol")
const cartControl=require("../controller/cartcontrol")
const orderControl=require("../controller/ordercontrol")
const wishlistControl=require("../controller/wishlistcontrol")
const couponControl=require("../controller/couponcontrol")
const bcrypt=require("bcrypt")
const OTP = require("../models/otp");
const UserAuth=require("../middlewares/userAuth")
const adminAuth=require("../middlewares/adminAuth")
const walletControl=require('../controller/walletControl')


//user logged home page
user.get("/",UserAuth.verifyUser,userControl.userhome_get)
// INDEX page
user.get("/guest",adminAuth.adminExist,UserAuth.userexist,userControl.guest_get)
//user login 
user.get('/login',UserAuth.userexist,userControl.userlogin_get)
user.post("/user/login",UserAuth.userexist,userControl.userLogin);
//signup
user.get("/user/signup",UserAuth.userexist,userControl.usersignup_get)
user.post("/user/signup",UserAuth.userexist,userControl.userSignup)
//otp
user.get("/user/otp-senting",otpControl.otpSender)
//otp page
user.get("/user/otp",UserAuth.userexist,otpControl.otppage_get)
user.post("/user/otp",UserAuth.userexist,otpControl.OtpConfirmation)
//forgot password
user.get("/user/forgot-pass",UserAuth.userexist,userControl.forgetpass_get)
user.post("/user/forgot-pass",UserAuth.userexist,userControl.forgotPass)
// RESET PASSWORD
user.post("/user/reset-pass",UserAuth.userexist,userControl.resetpass)
user.get('/user/product/:productId',UserAuth.verifyUser,userControl.viewProduct)
user.get("/user/viewall-products",UserAuth.verifyUser,userControl.ShopProduct)
user.get("/search",UserAuth.verifyUser,userControl.ShopProduct)
user.get('/filter',UserAuth.verifyUser,userControl.filterProducts)
// GUEST 
user.get('/guest/product/:productId',UserAuth.userexist,userControl.guest_viewProduct)
user.get('/guest/shop',UserAuth.userexist,userControl.guest_shop)
user.get("/guest/search",UserAuth.userexist,userControl.guest_shop)
user.get('/guestfilter',UserAuth.userexist,userControl.guestfilterProducts)
//user logout
user.get("/user/logout",userControl.logout)
// User Cart
user.post("/addtocart/:productId",UserAuth.verifyUser,cartControl.addToCart)
user.get('/user/cart',UserAuth.verifyUser,cartControl.viewCart)
user.post('/updatequantity',UserAuth.verifyUser,cartControl.updateQuantity)
user.post('/removefromcart',UserAuth.verifyUser,cartControl.removeFromCart)
user.get('/getcartquantity',UserAuth.verifyUser,cartControl.getQuantity)
//place order
user.post('/updateProfile',UserAuth.verifyUser,userControl.editProfile)
user.get('/placeorder',UserAuth.verifyUser,orderControl.PlaceOrder)
user.post('/addAddress-Checkout',UserAuth.verifyUser,userControl.addaddressProfile)
user.post('/placeOrder',UserAuth.verifyUser,orderControl.postCheckout)
user.get('/ordersuccess',UserAuth.verifyUser,orderControl.orderSuccess)
user.get('/trackOrder',UserAuth.verifyUser,orderControl.orderHistory)
user.post('/verify-payment',UserAuth.verifyUser,orderControl.verifyPayment)
user.post('/downloadinvoice',UserAuth.verifyUser,orderControl.generateInvoices)
user.get('/downloadinvoice/:orderId',UserAuth.verifyUser,orderControl.downloadInvoice)
// User profile
user.get('/user/profile',UserAuth.verifyUser,userControl.userProfile)
user.get('/viewproduct/:orderId',UserAuth.verifyUser,userControl.vieworderedProduct)
user.get('/cancelorder/:orderId',UserAuth.verifyUser,userControl.cancelOrder)
user.get('/cancelproduct/:productId/:orderId',UserAuth.verifyUser,userControl.cancelproduct)
user.get('/returnorder/:orderId',UserAuth.verifyUser,orderControl.returnProduct )
user.get('/address',UserAuth.verifyUser,userControl.address)
user.post('/addaddressProfile',UserAuth.verifyUser,userControl.addaddressProfile)
user.delete('/deleteAddress/:addressId',UserAuth.verifyUser,userControl.deleteAddress)
user.get('/edituserAddress/:addressId',UserAuth.verifyUser,userControl.edituserAddress)
user.post('/edituserAddress/:addressId',UserAuth.verifyUser,userControl.updateediteduserAddress)
// User wishlist
user.get('/user/wishlist',UserAuth.verifyUser,wishlistControl.wishList)
user.post('/wishlist/:productId',UserAuth.verifyUser,wishlistControl.addtoWishList)
user.post('/wishlistdelete/:productId',UserAuth.verifyUser,wishlistControl.deletefromWishlist)
// coupons
user.get('/user/coupon',UserAuth.verifyUser,couponControl.coupon_get)
user.post('/checkcoupon',UserAuth.verifyUser,couponControl.coupon_check)
// Wallet
user.get("/user/wallet",UserAuth.verifyUser,walletControl.wallet_get)
module.exports=user;