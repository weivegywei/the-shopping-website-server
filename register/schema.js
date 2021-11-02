const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: String,
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String},//TODO: FE needs to make sure user enters password
    address: {type: String},
    country: {type: String, required: true},
    role: {type: String, required: true},
    type: {type: String, required: true, enum: ['regular', 'guest']},
    status: {type: String, required: true, enum: ['active', 'inactive']}
});

export const User = mongoose.model('User', userSchema);