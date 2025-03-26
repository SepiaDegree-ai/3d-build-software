import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

// Immediate execution test
console.log('Login component loaded');

const Login = () => {
  console.log('Login component rendering');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Component mount test
  useEffect(() => {
    // Debug mount
    window.alert("Login component mounted");
    
    // Test click handler attachment
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      console.log('Found submit button');
      submitButton.addEventListener('click', () => {
        console.log('Native click handler triggered');
      });
    } else {
      console.log('Submit button not found');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.alert("Login attempt starting...");

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      
      // Debug values
      window.alert(`Attempting login with email: ${email}`);
      
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      window.alert("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      window.alert(`Login error: ${err.message}`);
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add direct click handler
  const handleButtonClick = (e) => {
    console.log('Button clicked directly');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          {/* Debug info */}
          <p className="mt-2 text-center text-sm text-gray-600">
            Email length: {email.length}, Password length: {password.length}
          </p>
        </div>
        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
          onClick={() => console.log('Form clicked')}
        >
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded text-center">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled={isSubmitting}
                onChange={(e) => {
                  console.log('Email changed');
                  setEmail(e.target.value);
                }}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                disabled={isSubmitting}
                onChange={(e) => {
                  console.log('Password changed');
                  setPassword(e.target.value);
                }}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleButtonClick}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 