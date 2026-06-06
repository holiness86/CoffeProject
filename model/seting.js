const mongoose = require('mongoose')
const { stringify } = require('uuid')

const Schema = mongoose.Schema

const setingSchema = new Schema({
    coffeeName: {
        required: true,
        type: String,
        trim: true,
    },
    logo: {
        required: true,
        type: String,
        trim: true,
    },
    tableNumber: {
        required: true,
        type: Number,
        trim: true,
    },
    aboutCofe: {
        required: true,
        type: String,
        trim: true,
    },
    phoneNumber: {
        required: true,
        type: String,
        trim: true,
    },
    cofeStore: {
        required: true,
        type: String,
        trim: true,
    },
    features:{
        required: true,
        type: String,
        trim: true,
    },
    timeWork: {
        required: true,
        type: String,
        trim: true,
    },
    location: {
        required: true,
        type: String,
        trim: true,
    },
    email: {
        required: false,
        type: String,
        trim: true,
    },
    cafePicture: {
        required: true,
        type: [String],
        trim: true,
    },
    coment: {
        required: true,
        type: String,
        trim: true,
    },
    instagram: {
        required: true,
        type: String,
        trim: true,
    },
    telegram: {
        required: true,
        type: String,
        trim: true,
    },
    twitter: {
        required: true,
        type: String,
        trim: true,
    }
} , {timestamps: true})

const Seting = mongoose.model('Seting' , setingSchema)
module.exports = Seting