const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {type: mongoose.Types.ObjectId},
    cartId: {type: mongoose.Types.ObjectId},
    orderId: {type: String, unique: true},
    payerId: {type: String, required: true},
    paymentId: {type: String, required: true},
    amount: {type: Number},
    currency: {type: String, enum:['EUR', 'USD', 'CNY', 'GBP']},
    status: {type: String, enum: ['paid', 'shipped', 'delivered', 'returned', 'refunded']},
    events: [Object]
},
{timestamps: true});

export const Payment = mongoose.model('Payment', paymentSchema);

const guestPaymentSchema = new mongoose.Schema({
    guestId: {type: String},
    cartId: {type: mongoose.Types.ObjectId},
    orderId: {type: String, unique: true},
    payerId: {type: String, required: true},
    paymentId: {type: String, required: true},
    amount: {type: Number},
    currency: {type: String, enum:['EUR', 'USD', 'CNY', 'GBP']},
    status: {type: String, enum: ['paid', 'shipped', 'delivered', 'returned', 'refunded']},
    events: [Object]
},
{timestamps: true});

export const GuestPayment = mongoose.model('GuestPayment', guestPaymentSchema);

