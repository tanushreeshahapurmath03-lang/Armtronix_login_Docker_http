import React, { useState } from 'react';
import apiClient from './api/client';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import PWAWrapper from './PWAWrapper'; // Import PWAWrapper

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/login', { email, password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      sessionStorage.setItem("loggedInUserEmail", response.data.user.email);

      if (response.data.requirePasswordChange) {
        navigate('/change-password');
      } else {
        navigate(response.data.user.role === 'admin' ? '/admin' : '/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // <PWAWrapper className="install-button1" showInstallButton={true} installButtonPosition="bottom-center"> 
      <div className="login-page-container" style={{ backgroundImage: 'url(/Images/login_Background.avif)', backgroundSize: 'cover' }}>
        <div className="logo-container">
          <div className="logo-content">
            <Link to="/">
              <img src="/Images/Logo.png" alt="Armtronix Iot Pvt. Ltd." className="ARMlogo-img" />
            </Link>
          </div>
        </div>
        <div className="login-container">
          <div className="login-form">
            <div className="form-icon">
              <img src="/Images/people1.png" alt="Login Icon" />
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="options">
                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
              </div>

              <button type="submit" className="login-btn" disabled={loading || !email || !password}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    // </PWAWrapper>
  );
}

export default Login;
