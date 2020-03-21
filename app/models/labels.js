const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const labelSchema = new Schema({
    _v: { type: Number, select: false },
    name: { type: String, required: true },
    avatar_url: { type: String },
    introduction: { type: String, select: false },

})

module.exports = model('Label', labelSchema);