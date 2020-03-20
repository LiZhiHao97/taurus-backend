const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    __v: {type: Number,select: false},
    name: { type: String, required: true },
    password: { type: String, require: true, select: false }

});

module.exports = model('User', userSchema); 