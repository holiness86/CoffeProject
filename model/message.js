const mongoose = require('mongoose')

const Schema = mongoose.Schema
const messageSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        trim: true,
        type: String,
        lowercase: true
    },
    message: {
        required: true,
        trim: true,
        type: String
    }
}, {timestamps: true})

const message = mongoose.model('message' , messageSchema)
module.exports = message