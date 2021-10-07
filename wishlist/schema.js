const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    ownerId: {type: String, required: true, unique: true},
    listItems: [{
        productId: {type: String, required: true}, 
        specificationValue: {type: String}
    }]
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema)
