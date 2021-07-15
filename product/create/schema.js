import { ObjectId } from 'bson';
import { productCategory } from '../../const/constants';

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    manufacturerId: {type: ObjectId, required: true},
    price: {type: Number, required: true},
    imageUrl: {type: String, required: true},
    availability: {type: Boolean, required: true},
    inventory: {type: Number, required: true},
    specification: {type: String, enum: ['','type','volume', 'size', 'color', 'flavor','aroma']},
    specificationDescr: [String],
    rating: {type: {1:[String],2:[String],3:[String],4:[String],5:[String]}},
    description: {type: String, required: true},
    packageSize: {type: String},
    category: {type: String,required: true, enum: productCategory}
  });

export const Product = mongoose.model('Product', productSchema);