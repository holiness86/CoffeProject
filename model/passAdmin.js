const mongoose = require('mongoose')

const Schema = mongoose.Schema

const passSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    }
} , {timestamps: true})

const Pass = mongoose.model('pass' , passSchema)
module.exports = Pass
