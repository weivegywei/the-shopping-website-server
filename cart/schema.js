const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    status: {type: String, required: true, enum: [ 'active', 'closed' ]},
    cartItems: [{
      productId: {type: String, required: true}, 
      specificationValue: {type: String}, 
      quantity: {type: Number, required: true}
    }],
    coupons: [String]
  });

export const Cart = mongoose.model('Cart', cartSchema);