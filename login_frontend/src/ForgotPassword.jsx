import React, { useState } from 'react';
import apiClient from './api/client';
import './ForgotPassword.css';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div className="login-page-container" style={{ backgroundImage: 'url(/Images/login_Background.avif)', backgroundSize: 'cover' }}>
      <div className="logo-container">
        <div className="logo-content">
          <Link to="/">
            <img src="/Images/Logo.png" alt="Armtronix Logo" className="ARMlogo-img" />
          </Link>
        </div>
      </div>
      <div className="login-container">
        <div className="login-form">
          <div className="form-icon1">
            <img src="/Images/3.png" alt="Login Icon" />
          </div>
          {/* <h2>Forgot Password</h2> */}
          <form onSubmit={handleForgotPassword}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className='login-btn' type="submit">Send Reset Link</button>
          </form>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
