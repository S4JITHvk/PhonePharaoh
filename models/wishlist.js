const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const wishlistSchema = new Schema({
    userId: { type: Schema.Types.ObjectId },
    products: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Products'}  
    }],
    
  });
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
 