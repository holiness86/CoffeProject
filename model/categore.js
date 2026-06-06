const mongoose = require('mongoose')


const Schema = mongoose.Schema
const categoreSchema = new Schema({
    name : {
        required: true,
        type: String,
        trim: true,
    },
} ,{timestamps: true})


const Categore = mongoose.model('categore' , categoreSchema)
module.exports = Categore