const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema({
  description: String,
  couponCode: String,
  minPurchaseAmount: Number,
  discount: Number,
  maxdiscountAmount: Number,
  expiryDate: {
    type: Date,
    required: true,
  },
  usedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
