const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  table: {
    type: Number,
    required: true,
    trim: true,
  },

  order: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'iteam',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],

  status: {
    type: String,
    enum: [
      'pending',
      'preparing',
      'delivered'
    ],
    default: 'pending'
  }

}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)








// const mongoose = require('mongoose')

// const Schema = mongoose.Schema
// const orderSchema = new Schema({
//     // table: {
//     //     required: true,
//     //     trim: true,
//     //     type: Number,
//     //     unique: true,
//     // },
//     table: { type: Number, required: true, trim: true },
//     order: [{ type: String, required: true, trim: true }]
//     // order:[
//     //     {
//     //     required: true,
//     //     trim: true,
//     //     type: String,
//     //     }
//     // ],
// } , {timestamps: true})

// const order = mongoose.model('Order' , orderSchema)
// module.exports = order