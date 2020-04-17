const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const topicSchema = new Schema({
    __v: { type: Number, select: false },
    title: { type: String, required: true },
    description: { type: String },
    sponsor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    labels: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Label' }],
        required: true
    },
    followerCount: {
        type: Number,
        default: 0,
        required: false
    },
    visitorCount: {
        type: Number,
        default: 0,
        required: false
    },
    hot: {
        type: Number,
        default: 0,
        required: false
    }
}, { timestamps: true })

module.exports = model('Topic', topicSchema);