const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const messageSchema = new Schema({
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true},
    answerId: { type: Schema.Types.ObjectId, ref: 'Answer', required: true},
    isRead: { type: Boolean, default: false, required: true }
}, { timestamps: true })

module.exports = model('Message', messageSchema);