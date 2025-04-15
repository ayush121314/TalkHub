import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle } from 'react-feather';

export const AuthForms = () => {
  const { login, register, sendOtp, error: authError } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    otp: ''
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false); // New loading state

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleError = (err) => {
    setError(err.message);
    setTimeout(() => setError(''), 2000);
  };

  const handleOtpRequest = async () => {
    setError('');
    setIsSendingOtp(true);
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
    } catch (err) {
      handleError(err);
    } finally {
      setIsSendingOtp(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-white shadow-md border border-blue-100 rounded-xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent" />
        
        <div className="text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight"
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h2>
          <p className="text-gray-600 mt-3 font-light">
            {isLogin ? 'Continue your learning journey' : 'Start your educational adventure'}
          </p>
        </div>

        <AnimatePresence>
          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mt-6 border border-red-100"
            >
              ⚠️ {error || authError}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          <AnimatePresence mode='wait'>
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="group">
                  <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-800"
                    placeholder="Alex Johnson"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="group">
            <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-800"
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-800"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <AnimatePresence>
            {!isLogin && (
              <motion.div
                key="role-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <div className="relative group">
                  <label className="block text-gray-700 text-sm font-medium mb-2 ml-1">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 appearance-none text-gray-800"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">User</option>
                    {/* <option value="professor">Professor</option>
                    <option value="admin">Administrator</option> */}
                  </select>
                  <ChevronDown className="absolute right-3 top-10 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4"
                >

{!otpSent && (
      <button
        type="button"
        onClick={handleOtpRequest}
        disabled={isSendingOtp}
        className="w-full py-3 px-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-700 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSendingOtp ? (
          <>
            <svg 
              className="animate-spin h-5 w-5 text-gray-700" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </>
        ) : (
          'Send Verification OTP'
        )}
      </button>
    )}

    {otpSent && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <input
          name="otp"
          type="text"
          required
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 placeholder:text-gray-400 text-gray-800"
          placeholder="Enter 6-digit OTP"
          value={formData.otp}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={handleOtpRequest}
          disabled={isSendingOtp}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {isSendingOtp ? 'Resending...' : 'Resend OTP'}
        </button>
      </motion.div>
    )}

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 rounded-xl text-lg font-semibold text-white transition-all duration-300 shadow-md"
          >
            {isLogin ? 'Sign In' : 'Get Started'}
          </motion.button>

          {/* Add Forgot Password link - only visible on login form */}
          {isLogin && (
            <div className="text-center mt-4">
              <button
                onClick={() => window.location.href = '/forgot-password'}
                className="text-blue-600 hover:text-blue-700 transition-colors duration-300 text-sm"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </form>

        <motion.div className="text-center mt-6 relative z-10">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-300 font-light text-sm"
          >
            {isLogin ? 
              "Don't have an account? " : 
              "Already have an account? "}
            <span className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isLogin ? 'Register now' : 'Sign in'}
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthForms;