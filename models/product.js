const mongoose = require('mongoose');



const { Schema, ObjectId } = mongoose;
const imageSchema = new mongoose.Schema({
  mainimage: {
    type: String,
  },
  image1: {
    type: String,
  },
  image2: {
    type: String,
  }
});
const ProductsSchema = new Schema({
  name: { type: String },
  images: [imageSchema],
  description: { type: String},
  spec1:{type:String},
  spec2:{type:String},
  spec3:{type:String},
  stock: { type: Number },
  basePrice: { type: Number},
  descountedPrice: { type: Number},
  timeStamp: { type: Date },
  brandId: { type: Schema.Types.ObjectId },
  categoryId: { type: Schema.Types.ObjectId },
  beforeOffer:{type : Number},
});

const Products = mongoose.model('Products', ProductsSchema);

module.exports=Products;

