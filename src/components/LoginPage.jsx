import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { restaurantService } from '../services/restaurantService';
import { UtensilsCrossed, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: ''
  });

  const { state, dispatch, actionTypes } = useApp();

  // Auto-navigate if user is already logged in
  useEffect(() => {
    if (state.user && !state.loading) {
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
    }
  }, [state.user, state.loading, dispatch, actionTypes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (formData.email === 'demo@mealmind.com' && formData.password === 'demo123') {
      return true; // Allow demo login
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (isSignUp) {
      if (!formData.displayName.trim()) {
        setError('Display name is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (formData.phoneNumber && !/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
        setError('Please enter a valid phone number');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Demo login bypass
      if (formData.email === 'demo@mealmind.com' && formData.password === 'demo123') {
        // Create a mock user for demo
        const mockUser = {
          uid: 'demo-user',
          email: 'demo@mealmind.com',
          displayName: 'Demo User',
          phoneNumber: '+1234567890'
        };
        dispatch({ type: actionTypes.SET_USER, payload: mockUser });
        dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Sign up new user
        const user = await restaurantService.createUser(
          formData.email,
          formData.password,
          formData.displayName,
          formData.phoneNumber
        );

        setSuccess('Account created successfully! You are now logged in.');
        dispatch({ type: actionTypes.SET_USER, payload: user });

        // Navigate to order type page after brief success message
        setTimeout(() => {
          dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
        }, 1500);

      } else {
        // Sign in existing user
        const user = await restaurantService.signInUser(formData.email, formData.password);
        dispatch({ type: actionTypes.SET_USER, payload: user });
        dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
      }

    } catch (error) {
      console.error('Authentication error:', error);

      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/email-already-in-use':
          setError('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError(error.message || 'An error occurred. Please try again.');
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      await restaurantService.resetPassword(formData.email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (error) {
      setError('Error sending reset email. Please check your email address.');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const user = await restaurantService.signInWithGoogle();
      dispatch({ type: actionTypes.SET_USER, payload: user });
      dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      phoneNumber: ''
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50"
         style={{
           backgroundImage: `url('https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <div className="w-full max-w-md p-8 mx-4 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-orange-500 rounded-full">
            <UtensilsCrossed className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-orange-500">Meal Minds</h1>
          <p className="text-gray-600">Fast Food Billing System</p>
        </div>

        <div className="mb-6">
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => isSignUp && toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isSignUp
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => !isSignUp && toggleMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isSignUp
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
              {success}
            </div>
          )}

          {isSignUp && (
            <div className="relative">
              <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required={isSignUp}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {isSignUp && (
            <div className="relative">
              <Phone className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone Number (optional)"
                className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="relative">
            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full py-3 pl-10 pr-12 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-gray-400 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-orange-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {isSignUp && (
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required={isSignUp}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Google Sign-In Option */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>

        {!isSignUp && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-sm text-orange-500 transition-colors hover:text-orange-600 disabled:text-orange-300"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-gray-600 transition-colors hover:text-orange-500"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <div className="pt-4 mt-6 text-sm text-center text-gray-500 border-t border-gray-200">
          <p className="mb-1 font-medium text-gray-600">Demo Login:</p>
          <p>📧 demo@mealmind.com</p>
          <p>🔑 demo123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
