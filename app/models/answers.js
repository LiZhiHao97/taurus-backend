const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const answerSchema = new Schema({
    __v: { type: Number, select: false },
    content: { type: String, required: true },
    answerer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    voteCount: { type: Number, required:true, default: 0 },
    replyCount: {type: Number, required: true, default: 0}
}, { timestamps: true })

module.exports = model('Answer', answerSchema);