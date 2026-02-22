import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Lock, User, ArrowRight } from 'react-feather';
// Import SVG illustrations
import loginIllustration from '../assets/login-illustration.svg';
import registerIllustration from '../assets/register-illustration.svg';

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      handleError(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-gray-100 to-blue-50 p-4 sm:p-6">
      <div className="absolute top-0 right-0 w-1/3 h-screen bg-indigo-50 z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden shadow-xl z-10 flex flex-col ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'}`}
      >
        {/* Form Section */}
        <div className="w-full md:w-[55%] p-8 md:p-12">
          <div className="mb-8">
            <motion.h1
              key={isLogin ? "login-title" : "register-title"}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight"
            >
              {isLogin ? 'Welcome to Talk Hub' : 'Join Talk Hub Today'}
            </motion.h1>
            <p className="mt-3 text-gray-600">
              {isLogin ? 'Sign in to continue to your account' : 'Create a new account to get started'}
            </p>
          </div>

          <AnimatePresence>
            {(error || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100"
              >
                {error || authError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition duration-200 outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition duration-200 outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => window.location.href = '/forgot-password'}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition duration-200 outline-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition duration-200 outline-none appearance-none"
                        disabled={isSubmitting}
                      >
                        <option value="student">User</option>
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                        <ChevronDown size={18} />
                      </span>
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleOtpRequest}
                      disabled={isSendingOtp || isSubmitting}
                      className="w-full flex items-center justify-center py-3 px-4 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl text-gray-700 font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {isSendingOtp ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Verification Code...
                        </>
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition duration-200 outline-none"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={handleOtpRequest}
                        disabled={isSendingOtp || isSubmitting}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {isSendingOtp ? 'Resending...' : 'Resend code'}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all duration-200 mt-8 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2" size={18} />
                </>
              )}
            </motion.button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isSubmitting}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200 disabled:opacity-50"
              >
                {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>

        {/* Illustration Section */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isLogin ? "login-ill" : "register-ill"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:block md:w-[45%] bg-gradient-to-b from-indigo-50 to-blue-50 relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
              >
                <img
                  src={isLogin ? loginIllustration : registerIllustration}
                  alt={isLogin ? "Login Illustration" : "Register Illustration"}
                  className="w-full h-auto"
                />
              </motion.div>
            </div>

            {/* Brand overlay */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TALK HUB
              </h2>
              <p className="text-blue-700 mt-1 text-sm">Connect and communicate</p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-blue-200 opacity-20"></div>
            <div className="absolute bottom-20 left-10 w-16 h-16 rounded-full bg-indigo-300 opacity-20"></div>
            <div className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full bg-purple-300 opacity-20"></div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthForms;