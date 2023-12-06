const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const OrdersSchema = new Schema({
  UserId: { type: Schema.Types.ObjectId },
  Status: { type: String, default:"Order Placed"},
  Items: [{
     productId: { type: Schema.Types.ObjectId , ref: "Products" },
     productname:{type:String},
     productprice:{type:Number},
     quantity: { type: Number },
     discountPercent: { type: Number} 
  }],
  PaymentMethod: {type: String},
  OrderDate: { type: Date },
  ExpectedDeliveryDate:{type: String},
  coupon:{type:Number},
  TotalPrice: { type: Number },
  PaymentStatus: {type: String, default: "Pending"},
  CouponId: { type: Schema.Types.ObjectId },

  Address: [{
    Name:{type:String},
    AddressLane: { type: String },
    City: { type: String },
    Pincode: { type: Number },
    State: { type: String },
    Mobile: { type: Number },
 }],
});

const Orders = mongoose.model('Orders', OrdersSchema);

module.exports = Orders
