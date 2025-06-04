'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Function to encrypt data using Web Crypto API
  const encryptData = async (data) => {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  };

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setError('');
    
    if (!validateForm()) {
      return false; // Prevent form submission
    }
    
    setLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedPassword');
        }
        router.push('/categories');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
    return false; // Prevent form submission
  };

  const handleInputChange = (e, setter) => {
    e.preventDefault(); // Prevent any default behavior
    setter(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="flex items-center justify-center bg-army-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border-l-4 border-army-green-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-army-dark">
            Log in to TaskFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your tasks efficiently
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-medium">Login Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <form 
          className="mt-8 space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return handleSubmit(e);
          }} 
          noValidate
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-army-dark mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={`form-input ${error && !username ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => handleInputChange(e, setUsername)}
                disabled={loading}
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-army-dark mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`form-input pr-10 ${error && !password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword)}
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-5">
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 justify-end p-1 rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-army-green-800 focus:ring-army-green-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full flex justify-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : "Log In"}
          </button>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-army-green-800 hover:text-army-green-700">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}