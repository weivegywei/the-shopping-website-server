const mongoose = require('mongoose');

const guestCartSchema = new mongoose.Schema({
    guestId: {type: String, required: true},
    status: {type: String, required: true, enum: [ 'active', 'closed' ]},
    cartItems: [{
      productId: {type: String, required: true}, 
      specificationValue: {type: String}, 
      quantity: {type: Number, required: true}
    }],
    coupons: [String]
  },
  {timestamps: true});

export const GuestCart = mongoose.model('GuestCart', guestCartSchema);
