import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from './api/client';
import { Link } from 'react-router-dom';
import './Login.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/api/auth/reset-password/${token}`, { newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
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
          <div className="form-icon2">
            <img src="/Images/4.png" alt="Login Icon" />
          </div>
          <h2>Reset Password</h2>
          <form onSubmit={handleReset}>
            <div className="password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button className='login-btn' type="submit">Reset Password</button>
          </form>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
