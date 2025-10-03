import React, { useState, useEffect } from 'react';
import { Phone, Shield, CheckCircle, AlertCircle, Clock, ArrowRight, Smartphone } from 'lucide-react';
import axios from 'axios';

const OTPVerification = () => {
  const [step, setStep] = useState(1); // 1: phone input, 2: otp verification
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Base URL for your backend
  const API_BASE_URL = import.meta.env.REACT_APP_API_URL; // Update this to your backend URL

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && step === 2) {
      setCanResend(true);
    }
  }, [timer, step]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle phone number input
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace in OTP input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Send OTP
  const sendOTP = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/send-otp`, {
        phoneNumber: `+91${phoneNumber}` // Assuming Indian numbers, adjust as needed
      });

      if (response.data.success) {
        setSuccess(response.data.msg);
        setStep(2);
        setTimer(60); // 2 minutes
        setCanResend(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        phoneNumber: `+91${phoneNumber}`,
        otp: otpString
      });

      if (response.data.success) {
        setSuccess(response.data.msg);
        // Handle successful verification (redirect, etc.)
        setTimeout(() => {
          // Reset form or redirect
          setStep(1);
          setPhoneNumber('');
          setOtp(['', '', '', '', '', '']);
          setSuccess('');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    await sendOTP();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Phone Verification' : 'Enter OTP'}
          </h1>
          <p className="text-gray-600">
            {step === 1 
              ? 'Enter your phone number to receive a verification code' 
              : `We've sent a 6-digit code to +91${phoneNumber}`
            }
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Step 1: Phone Number Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+91</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="9876543210"
                    className="block w-full pl-20 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                    maxLength={10}
                  />
                </div>
                {phoneNumber && phoneNumber.length === 10 && (
                  <div className="absolute right-3 top-9 text-green-500">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <button
                onClick={sendOTP}
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center space-x-2 mb-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              {timer > 0 && (
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Resend OTP in {formatTime(timer)}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={verifyOTP}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  onClick={resendOTP}
                  disabled={!canResend || loading}
                  className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 font-medium transition-colors duration-200"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>

              {/* Change Number */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                    setSuccess('');
                    setTimer(0);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center justify-center mx-auto space-x-1"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Change phone number</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure verification powered by SMS
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;