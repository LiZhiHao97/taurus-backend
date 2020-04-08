const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const labelSchema = new Schema({
    _v: { type: Number, select: false },
    name: { type: String, required: true, unique: true },
    avatar_url: { type: String, default: '' },
    introduction: { type: String, select: false },
    type: { type: Number, enum: [1, 2, 3, 4, 5], required: true }
}, { timestamps: true })

module.exports = model('Label', labelSchema);