const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const shareSchema = new Schema({
    __v: { type: Number, select: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', require: true },
    covers: {
        type: [{ type: String}],
        required: true
    },
    voteCount: { type: Number, default: 0, required: true },
}, { timestamps: true })

module.exports = model('Share', shareSchema);