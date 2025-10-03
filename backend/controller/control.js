const OtpSchema = require('../model/otp')
const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const {otpVarification} = require('../helper/OtpValidate')

const Account_SID = process.env.Account_SID;
const Auth_Token = process.env.Auth_Token;

const twilioClient = new twilio(Account_SID, Auth_Token);

module.exports.sendOtp = async (req, res) => {
    try {

        const {phoneNumber} = req.body;
        const current_date = new Date();
        const otp = otpGenerator.generate(6, {
            lowerCaseAlphabets: false, specialChars: false, upperCaseAlphabets: false,
        })

        await OtpSchema.findOneAndUpdate(
            {phoneNumber}, 
            {otp, otpExpiry: new Date(current_date.getTime())},
            {upsert: true, new: true, setDefaultsOnInsert: true}, 
        )

        await twilioClient.messages.create({
            body: `Your Verfication Otp is ${otp}`,
            to: phoneNumber, 
            from: process.env.TWILIO_PHONE_NUMBER,
        })

        res.status(200).json({
            success: true,
            msg: `Otp: ${otp} Sent Successfully`,
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports.verifyOtp = async (req, res) => {
    try {
        const {phoneNumber, otp} = req.body;

        const otpData = await OtpSchema.findOne({phoneNumber, otp});

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "You Have Entered Wrong Otp",
            })
        }

        const isOtpExpired = await otpVarification(otpData.otpExpiry);

        if (isOtpExpired) {
            return res.status(410).json({
                success: false,
                msg: "Your Otp Has Been Expired",
            })
        }

        return res.status(200).json({
            success: true,
            msg: "Your Otp Has Been Verified Successfully",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}