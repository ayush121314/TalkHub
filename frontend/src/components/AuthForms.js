import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthForms = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
    otp: ''  // New OTP state
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);  // Flag for OTP sent

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpRequest = async () => {
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setOtpSent(true);  // Mark OTP as sent
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${apiUrl}/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? {
          email: formData.email,
          password: formData.password
        } : { ...formData, otp: formData.otp })  // Send OTP in registration
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      navigate(data.user.role === 'student' ? '/dashboard' : '/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-gray-700 shadow-2xl rounded-xl p-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white tracking-wide">
            {isLogin ? 'Welcome Back' : 'Join Now'}
          </h2>
          <p className="text-gray-300 mt-2">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        {error && (
          <div className="bg-red-500 text-white text-center p-2 mt-4 rounded-lg shadow">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-gray-300 text-sm font-medium">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white py-3 px-4 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white py-3 px-4 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white py-3 px-4 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label htmlFor="role" className="block text-gray-300 text-sm font-medium">Role</label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white py-3 px-4 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {/* OTP Request Button */}
              <div>
                <button
                  type="button"
                  onClick={handleOtpRequest}
                  className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg"
                >
                  Send OTP
                </button>
              </div>
               {/* OTP Input Field */}
               {otpSent && (
                <div>
                  <label htmlFor="otp" className="block text-gray-300 text-sm font-medium">Enter OTP</label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-600 bg-gray-800 text-white py-3 px-4 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            >
              {isLogin ? 'Sign in' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 transition duration-200"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
