const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const topicSchema = new Schema({
    __v: { type: Number, select: false },
    title: { type: String, required: true },
    description: { type: String },
    sponsor: { type: Schema.Types.ObjectId, ref: 'User', required: true, select: false },
    labels: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
        select: false,
        required: true
    }
})

module.exports = model('Topic', topicSchema);