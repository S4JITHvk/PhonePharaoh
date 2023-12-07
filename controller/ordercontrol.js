require('../config/DBconnection')
const User=require('../models/user')
const Cart=require('../models/Cart')
const Order = require("../models/orders")
const Product=require('../models/product')
const Coupon=require('../models/coupon')
const moment = require('moment');
const razorpay = require("../util/razorpay");
const crypto=require('crypto')
const mongoose = require("mongoose");
const { findById } = require('../models/brand')
const wallet=require('../models/wallet')
const nodemailer = require("nodemailer");
const { generateInvoice } =require('../util/invoiceCreator')
const fs = require("fs");
const path = require("path");

const PlaceOrder=async(req,res)=>{
  try{
    const email = req.session.email;
    const username=req.session.name
    const user = await User.findOne({ email: email })
    const userid=user._id
    const cart = await Cart.findOne({ userId: userid }).populate(
      "products.productId"
    );
    let subtotal = 0;
    let totalQuantity = 0;
    cart.products.forEach((item) => {
      subtotal += item.quantity * item.productId.descountedPrice;
      totalQuantity += item.quantity;
    });
    const gstRate = 0.02;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;
    req.session.totalPrice = total;
   const Wallet = await wallet.findOne({ userId: userid }); 
    const walletamount = Wallet ? Wallet.Amount : 0;
res.render('./user/checkout', {username, user,total,walletamount})
  }catch(error){
    console.log(error)
  }
}








//order placing 
const postCheckout=async(req,res)=>{
    try {
        const PaymentMethod = req.body.paymentMethod;
        const Address = req.body.Address;
        const Email=req.session.email
        const amount = req.session.totalPrice;
        const couponCode=req.session.code
        const price=parseInt(amount)
        const user = await User.findOne({
          email:Email,
          Address:{
            $elemMatch:{_id: new mongoose.Types.ObjectId(Address)} 
          }
        })
        const matchedAddress = user.Address.find(a => a._id.equals(Address));
        const add = {
          Name:matchedAddress.Name,
          AddressLane: matchedAddress.AddressLane,
          Pincode: matchedAddress.Pincode,
          City: matchedAddress.City,
          State: matchedAddress.State,
          Mobile: matchedAddress.Mobile,
        }
     
        const userid = user._id;
        await Coupon.updateOne(
          { couponCode: couponCode },
          { $push: { usedBy: { userId: userid } } }
        );
       
        
        const cart = await Cart.findOne({ userId: userid }).populate("products.productId");
        
        if (!cart) {
            console.error("No cart found for the user.");
            return res.render('./error/404');
          }
          for (const item of cart.products) {
            const productId = item.productId;
            const quantity = item.quantity;
            const product = await Product.findById(productId);
            const productname=product.name
            if (!product || product.stock < quantity) {
              console.error(`Insufficient stock for product ${productId}.`);
              return res.json({ error: `Insufficient stock for product ${productname}.` });
            }
            
          
          }
         

        const newOrders = new Order({
            UserId: userid,
            Items: cart.products,
            OrderDate:new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
          }),
            ExpectedDeliveryDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
           coupon:req.session.coupondiscount,
            TotalPrice: price,
            Address:add,
            PaymentMethod: PaymentMethod,
          });
          const order = await newOrders.save();
   
          await Cart.findByIdAndDelete(cart._id);
          
          req.session.orderId = order._id;
          for (const item of order.Items) {
            const productId = item.productId;
            const quantity = item.quantity;
            const product = await Product.findById(productId);
            if (product) {
                const updatedQuantity = product.stock - quantity;
                if (updatedQuantity < 0) {
                  product.stock = 0;
                  product.Status = "Out of Stock";
                } else {
                  product.stock = updatedQuantity;
                  await product.save();  
                }
              }
          }
          

          if (PaymentMethod === "cod") {
            const transporter = nodemailer.createTransport({
              port: 465,
              host: "smtp.gmail.com",
              auth: {
                user: "phonepharaoh04@gmail.com",
                pass: "mttm mhuz jrsz hcqm",
              },
              secure: true,
            });
            const mailData = {
              from: "phonepharaoh04@gmail.com",
              to: Email,
              subject: "Your Orders!",
              text:
                `Hello! ${user.userName} Your order  has been received and will be processed within one business day.` +
                ` your total price is ${req.session.totalPrice}`,
            };
            transporter.sendMail(mailData, (error, info) => {
              if (error) {
                return console.log(error);
              }
            })
       
            res.json({ codSuccess: true });

          }else if (PaymentMethod === "wallet") {
           
            const Wallet = await wallet.findOne({ userId: userid });
            const updatedWalletAmount = Wallet.Amount - price;
        
            await wallet.findOneAndUpdate(
                { userId: userid },
                {
                    Amount: updatedWalletAmount,
                    $push: {
                        transactions: {
                            amount: price,
                            timestamp: new Date().toLocaleString("en-US", {
                              timeZone: "Asia/Kolkata",
                          }),
                            type: 'debit',
                        },
                    },
                }
            );
        
                const orderId = req.session.orderId;
                const updateOrderDocument = await Order.findByIdAndUpdate(orderId, {
                    PaymentStatus: "Paid",
                    PaymentMethod: "Wallet",
                });
                
                res.json({ walletSuccess: true });
              }else{
            const order = {
              amount: price,
              currency: "INR",
              receipt: req.session.orderId,
            };
            await razorpay
              .createRazorpayOrder(order)
              .then((createdOrder) => {
               
                res.json({ online:true,createdOrder, order });
              })
              .catch((err) => {
                console.log(err);
              });
          }
          }
           catch (error) {
        console.error('Error placing order:', error);
       res.render('./error/404')
      }
    }
    const orderSuccess=(req,res)=>{
      const username = req.session.name
      res.render('./user/orderSuccess',{username})  
  }
    
//order history
const orderHistory = async (req, res) => {
  try {
      const Email = req.session.email;
      const username = req.session.name;
      const user = await User.findOne({ email: Email });
      const userid = user._id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5; 
      const orders = await Order.find({ UserId: userid })
          .sort({ OrderDate: -1 })
          .populate({
              path: 'Items.productId',
              model: Product,
          })
          .skip((page - 1) * limit)
          .limit(limit);
      const totalOrders = await Order.countDocuments({ UserId: userid });
      if (orders.length === 0) {
          return res.render('./user/orderhistory', { username, orders: [], totalOrders,  page,  totalPages: Math.ceil(totalOrders / limit ),limit });
      } else {
          res.render('./user/orderhistory', {
              username,
              orders: orders,
              totalOrders,
               page,
               totalPages: Math.ceil(totalOrders / limit),
               limit
          });
      }
  } catch (error) {
      console.log("error in track order:", error);
      res.render('./error/404');
  }
};


const verifyPayment=async(req,res)=>{
  try {
    let hmac = crypto.createHmac("sha256", process.env.KEY_SECRET);  
    hmac.update(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac === req.body.payment.razorpay_signature) {
      const orderId = new mongoose.Types.ObjectId(
        req.body.order.createdOrder.receipt
      );  
      const updateOrderDocument = await Order.findByIdAndUpdate(orderId, {
        PaymentStatus: "Paid",
        PaymentMethod: "Online",
      });
      console.log("hmac success");
      res.json({ success: true });
    } else {
      console.log("hmac failed");
      res.json({ failure: true });
    }
  } catch (error) {
    console.error("failed to verify the payment",error);
  }
}

//  ADMIN ORDERS MANAGEMENT
const OrderList = async (req, res) => {
  const limit = parseInt(req.query.limit) || 8; 
  const page = parseInt(req.query.page) || 1; 
  try {
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    const orders = await Order.find()
      .sort({ OrderDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const userPromises = orders.map((order) => {
      return User.findById(order.UserId);
    });
    const users = await Promise.all(userPromises);
    res.render('./admin/orders', {
      order: orders,
      users: users,
       page,
      totalPages: totalPages,
      limit
    });
  } catch (error) {
    console.error(error);
    res.render('./error/404');
  }
};


const updateOrderStatus = async (req, res) => {
  try {
      const orderId = req.params.orderId;
      const newStatus = req.body.status;

      if(newStatus==="Rejected"){
        const order= await Order.findById( orderId )
        const productsToUpdate = order.Items;
        for (const product of productsToUpdate) {
          const cancelProduct = await Product.findById(product.productId);      
          if (cancelProduct) {
            cancelProduct.stock += product.quantity;
            await cancelProduct.save();
          }
        }   
      }
      await Order.findByIdAndUpdate(orderId, { Status: newStatus });
      if (newStatus === "Delivered") {
          await Order.findByIdAndUpdate(orderId, { PaymentStatus: "Paid" });
      }
      res.json({ success: true });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.json({ success: false });
  }
};


const viewOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderDetails = await Order.findOne({ _id: orderId }).populate(
      "Items.productId"
    );
    res.render('./admin/orderviewproduct', { order: orderDetails });
  } catch (error) {
    console.log('Error viewing ordered products:', error);
  }
};


const returnProduct = async (req, res) => {
  try {
    console.log("iam here")
      const email = req.session.email;
      const user = await User.findOne({ email: email });
      const userId = user._id;
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId);
      if (order) {
          order.Status = "Returned";
          await order.save();
          res.redirect('/trackOrder');
      } else {
          console.log("Order not found");
      }
  } catch (error) {
      console.log(error);
  }
};
const returnaccept = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const userid = order.UserId;
    if (order) {
      const productsToUpdate = order.Items;
      for (const product of productsToUpdate) {
        const cancelProduct = await Product.findById(product.productId);      
        if (cancelProduct) {
          cancelProduct.stock += product.quantity;
          await cancelProduct.save();
        }
      }
      const userExist = await wallet.findOne({ userId: userid });
      if (userExist) {
        await wallet.updateOne(
          { userId: userid },
          {
            $inc: { Amount: order.TotalPrice },
            $push: {
              transactions: {
                amount: order.TotalPrice,
                timestamp: new Date().toLocaleString("en-US", {
                  timeZone: "Asia/Kolkata",
              }),
                type: 'credit',
              },
            },
          }
        );
      } else {
        const newWallet = new wallet({
          userId: userid,
          Amount: order.TotalPrice,
          transactions: [{
            amount: order.TotalPrice,
            timestamp:new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
          }),
            type: 'credit',
          }],
        });
        await newWallet.save();
        console.log("Wallet updated");
      }
      order.Status = "Return Accepted";
      order.PaymentStatus="Refund Completed"
      await order.save();
      res.status(200).json({ success: true,message:"Succesfully updated order" });
    } else {
      console.log("Order not found");
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// INOVICE DOWNLOADER
const generateInvoices = async (req, res) => {
  try {
    const { orderId } = req.body;    
    const orderDetails = await Order.find({ _id: orderId })
      .populate("Address")
      .populate("Items.productId");  
    const ordersId = orderDetails[0]._id;
    if (orderDetails) {
      const pdfContent = await generateInvoice(orderDetails);

      // Set the response headers for downloading the PDF
      res.setHeader('Content-Disposition', `attachment; filename="invoice.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Send the PDF content in the response
      res.send(Buffer.from(pdfContent, 'base64'));
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to generate the invoice" });
    }
  } catch (error) {
    console.error("Error in generating the invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Error in generating the invoice" });
  }
};



module.exports={
    PlaceOrder,
    postCheckout,
    orderHistory,
    viewOrderDetails,
    updateOrderStatus,
    OrderList,
    verifyPayment,
    orderSuccess,
    returnProduct,
    generateInvoices,
    returnaccept
}