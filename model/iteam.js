const mongoose = require('mongoose')

const Schema = mongoose.Schema
const itemsSchema = new Schema({
    iteamName: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        trim: true,
        required: true,
    },
    picture: {
        type: String,
        required: false,
        trim: true
    },
    about: {
        required: false,
        trim: true,
        type: String,
    },
    categore: {
        // required: true,
        ref: 'categore',
        trim: true,
        type: mongoose.Schema.Types.ObjectId,
    },
} , {timestamps: true})

const Iteam = mongoose.model('iteam' , itemsSchema)
module.exports = Iteam