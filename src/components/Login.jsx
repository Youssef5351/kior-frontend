import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/kior.webp';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('User is already logged in, but allowing access to login page');
    }
  }, []);

  // Add this missing function
  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://kior-backend4-youssefelkoumi512-dev.apps.rm1.0a51.p1.openshiftapps.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setFormData({ email: '', password: '' });
        navigate(from, { replace: true });
      } else {
        if (response.status === 403) {
          setError(data.message || 'Access forbidden. Please check your credentials.');
        } else if (response.status === 401) {
          setError(data.message || 'Invalid email or password.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-bricolage">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-60 flex items-center justify-center mb-4">
            <span className=""><img src={logo} className='h-20 w-32' alt="" /></span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/register" 
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
            >
              create a new account
            </Link>
          </p>
        </div>


        {/* Login Form */}
        <form 
          className="mt-8 space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm" 
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">📧</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <span className="text-gray-400">
                    {showPassword ? '🙈' : '👁️'} {/* Fixed password visibility icons */}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full cursor-pointer flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-600 mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-lg mb-1">📊</div>
            <div>Systematic Reviews</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-lg mb-1">👥</div>
            <div>Collaborative Screening</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-lg mb-1">🚀</div>
            <div>Real-time Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
