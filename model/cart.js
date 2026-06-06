const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
  sessionId: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'iteam', required: true },
      quantity: { type: Number, default: 1 }
    }
  ]
})

module.exports = mongoose.model('Cart', cartSchema)
