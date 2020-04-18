const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    __v: {type: Number,select: false},
    name: { type: String, required: true,  unique: true },
    password: { type: String, require: true, select: false },
    email: { type: String, default: '', select: false },
    phone: { type: String, default: '', select: false },
    avatar_url: { type: String, default: 'http://localhost:8000/uploads/upload_eda93f3329b27ee1da7909762b547661.png' },
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    headline: { type: String, default: '' },
    locations: { type: [{type: String}], default: [], select: false },
    educations: {
        type: [{
            school: { type: String },
            major: { type: String },
            diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
            entrance_year: { type: Number },
            graduation_year: { type: Number }
        }],
        default: [],
        select: false
    },
    tags: { 
        type: [{type: Schema.Types.ObjectId, ref: 'Label'}],
        default: []
    },
    following: {
        // 这种type可以通过用户某个字段获取全部信息, 详见接口中的populate方法
        type: [{ type: Schema.Types.ObjectId, ref: 'User'}],
        default: [],
        select: false
    },
    followingTopics: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Topic'}],
        default: [],
        select: false
    },
    likingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        default: [],
        select: false
    },
    likingShares: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Share' }],
        default: [],
        select: false
    },
    dislikingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        default: [],
        select: false
    },
    createTopics: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
        default: [],
        select: false
    },
}, { timestamps: true });

module.exports = model('User', userSchema); 