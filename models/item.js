const mongoose = require('mongoose');
const { ITEM_LIMITS } = require('../constants/item');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: ITEM_LIMITS.name.min,
    maxLength: ITEM_LIMITS.name.max
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: ITEM_LIMITS.description.min,
    maxLength: ITEM_LIMITS.description.max
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', ItemSchema);
