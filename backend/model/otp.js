const {Schema, model} = require('mongoose');

const otpSchema = new Schema({
    phoneNumber: {type: String},
    otp: {type: String},
    otpExpiry: {
        type: Date, 
        default: Date.now,
        get: (otpExpiry) => otpExpiry.getTime(),
        set: (otpExpiry) => new Date(otpExpiry),
    }
})

module.exports = model("otp", otpSchema);