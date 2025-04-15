import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const { resetPasswordRequest, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await resetPasswordRequest(formData.email);
      setSuccess('OTP sent to your email.');
      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const isValid = await verifyOtp(formData.email, formData.otp);
      if (isValid) {
        setSuccess('OTP verified successfully.');
        setCurrentStep(3);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(formData.email, formData.otp, formData.newPassword);
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendOtp = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await resetPasswordRequest(formData.email);
      setSuccess('OTP resent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-white border border-blue-100 shadow-lg rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent" />
        
        <div className="text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-800 tracking-tight"
          >
            Reset Password
          </motion.h2>
          <p className="text-gray-600 mt-3 font-light">
            {currentStep === 1 && "Enter your email to receive an OTP"}
            {currentStep === 2 && "Enter the OTP sent to your email"}
            {currentStep === 3 && "Create a new password"}
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex justify-center mt-6 relative z-10">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-10 h-0.5 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mt-6 border border-red-200 shadow-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mt-6 border border-green-200 shadow-sm"
            >
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Email Form */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 space-y-6 relative z-10"
              onSubmit={handleSubmitEmail}
            >
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300/50 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-700 shadow-sm"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </div>
                ) : "Send OTP"}
              </motion.button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300 text-sm"
                >
                  Back to login
                </button>
              </div>
            </motion.form>
          )}
          
          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 space-y-6 relative z-10"
              onSubmit={handleVerifyOtp}
            >
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                  Enter OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300/50 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-700 shadow-sm"
                  placeholder="6-digit OTP"
                  value={formData.otp}
                  onChange={handleChange}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : "Verify OTP"}
              </motion.button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300 text-sm"
                >
                  Back to email
                </button>
              </div>
            </motion.form>
          )}
          
          {/* Step 3: New Password */}
          {currentStep === 3 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mt-8 space-y-6 relative z-10"
              onSubmit={handleResetPassword}
            >
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300/50 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-700 shadow-sm"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300/50 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-700 shadow-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password..
                  </div>
                ) : "Reset Password"}
              </motion.button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300 text-sm"
                >
                  Back to OTP verification
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword; 