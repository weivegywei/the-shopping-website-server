const mongoose = require('mongoose');

const manufacturerSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    logoUrl: {type: String, required: true, unique: true}
  });

export const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);