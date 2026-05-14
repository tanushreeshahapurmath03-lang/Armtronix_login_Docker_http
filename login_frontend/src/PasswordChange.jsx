import React, { useState, useEffect } from 'react';
import apiClient from './api/client'; // Adjust the path based on your file structure
import './PasswordChange.css';
function PasswordChange() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Use apiClient instead of making direct fetch requests
      const response = await apiClient.post('/api/auth/change-password', {
        newPassword
      });

      setSuccess('Password changed successfully! Redirecting to dashboard...');

      // Redirect after 2 seconds
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        window.location.href = user.role === 'admin' ? '/admin' : '/employee';
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='PC'>
      <div className="password-change-container">
        <h2>Change Password</h2>
        <p>You need to change your password before continuing.</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className='button2' type="submit" disabled={loading}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordChange;