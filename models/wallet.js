const mongoose = require('mongoose');
require("../config/DBconnection");
const { Schema } = mongoose;

const transactionSchema = new Schema({
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['debit', 'credit'], required: true }
});

const walletSchema = new Schema({
    userId: { type: Schema.Types.ObjectId },
    Amount: { type: Number },
    transactions: [transactionSchema]
});

const wallet = mongoose.model('wallet', walletSchema);

module.exports = wallet;
