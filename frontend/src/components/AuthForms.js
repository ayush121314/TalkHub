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

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleError = (err) => {
    setError(err.message);
    setTimeout(() => {
      setError(' '); 
    }, 2000);
  };
  const handleOtpRequest = async () => {
    setError('');
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
    } catch (err) {
      handleError(err);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-500 via-black to-slate-500 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        <div className="text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight"
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </motion.h2>
          <p className="text-gray-300/90 mt-3 font-light">
            {isLogin ? 'Continue your learning journey' : 'Start your educational adventure'}
          </p>
        </div>

        <AnimatePresence>
          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-400/20 text-red-200 px-4 py-3 rounded-lg mt-6 border border-red-400/30 backdrop-blur-sm"
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
                  <label className="block text-gray-300/90 text-sm font-medium mb-2 ml-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-purple-300/30 outline-none transition-all duration-300 placeholder:text-gray-400/60 text-gray-100"
                    placeholder="Alex Johnson"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="group">
            <label className="block text-gray-300/90 text-sm font-medium mb-2 ml-1">
              Email address
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-purple-300/30 outline-none transition-all duration-300 placeholder:text-gray-400/60 text-gray-100"
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="group">
            <label className="block text-gray-300/90 text-sm font-medium mb-2 ml-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-purple-300/30 outline-none transition-all duration-300 placeholder:text-gray-400/60 text-gray-100"
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
                  <label className="block text-gray-300/90 text-sm font-medium mb-2 ml-1">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-purple-300/30 outline-none transition-all duration-300 appearance-none text-gray-100"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-10 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-4"
                >
                  <button
                    type="button"
                    onClick={handleOtpRequest}
                    className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-100 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3"
                  >
                    {otpSent ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Send OTP Again!
                      </>
                    ) : (
                      'Send Verification OTP'
                    )}
                  </button>

                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <input
                        name="otp"
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-white/20 outline-none transition-all duration-300 placeholder:text-gray-400/60 text-gray-100"
                        placeholder="Enter 6-digit OTP"
                        value={formData.otp}
                        onChange={handleChange}
                      />
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
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 rounded-xl text-lg font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isLogin ? 'Sign In' : 'Get Started'}
          </motion.button>
        </form>

        <motion.div className="text-center mt-6 relative z-10">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-300/90 hover:text-white transition-colors duration-300 font-light text-sm"
          >
            {isLogin ? 
              "Don't have an account? " : 
              "Already have an account? "}
            <span className="font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {isLogin ? 'Register now' : 'Sign in'}
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthForms;