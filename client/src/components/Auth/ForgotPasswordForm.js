import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-8">
        {submitted ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600 mb-6">
              If <strong>{email}</strong> is registered, we've sent a password reset link. Check your inbox (and spam folder).
            </p>
            <button
              onClick={onSwitchToLogin}
              className="text-blue-700 hover:text-blue-600 font-medium text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
              <p className="text-gray-600 mt-2">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-sm text-blue-700 hover:text-blue-600 font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
