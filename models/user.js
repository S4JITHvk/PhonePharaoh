// Import required dependencies
const mongoose = require('mongoose');
const { Schema } = mongoose; // Import the Schema class from mongoose

// Import the database connection configuration
require("../config/DBconnection");



const userSchema = new Schema({
  userName: { type: String },
  email: { type: String },
  password: { type: String },
  timeStamp:{type:Date},
  Address: [{
    Name:{type:String},
    AddressLane: { type: String },
    City: { type: String },
    Pincode: { type: Number },
    State: { type: String },
    Mobile: { type: Number },
 }],
  ISactive: { type: Boolean, default: false }, // Correctly define as a Boolean
  ISbanned: { type: Boolean, default: false }, // Correctly define as a Boolean
});

// Create a Mongoose model for the "users" collection
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
