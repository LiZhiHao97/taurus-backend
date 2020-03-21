const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
    __v: {type: Number,select: false},
    name: { type: String, required: true },
    password: { type: String, require: true, select: false },
    avatar_url: { type: String },
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    headline: { type: String },
    locations: { type: [{type: String}], select: false },
    educations: {
        type: [{
            school: { type: String },
            major: { type: String },
            diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
            entrance_year: { type: Number },
            graduation_year: { type: Number }
        }],
        select: false
    },
    tags: { 
        type: [{type: Schema.Types.ObjectId, ref: 'Label'}],
        select: false 
    },
    following: {
        // 这种type可以通过用户某个字段获取全部信息, 详见接口中的populate方法
        type: [{ type: Schema.Types.ObjectId, ref: 'User'}],
        select: false
    }
});

module.exports = model('User', userSchema); 