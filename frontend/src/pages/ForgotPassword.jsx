// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaKey, FaLock, FaSpinner } from 'react-icons/fa';
import api from '../api/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: formData.email });
      setDevCode(res.data.devCode || '');
      alert(res.data.message);
      setStep('code');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-code', {
        email: formData.email,
        code: formData.code
      });
      alert(res.data.message);
      setStep('password');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: formData.email,
        code: formData.code,
        password: formData.password
      });
      alert(res.data.message);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '460px', margin: 'auto', padding: '2.5rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Reset Password</h1>
      <p style={{ textAlign: 'center', color: '#777', marginBottom: '2rem' }}>
        {step === 'email' && 'Enter your registered email to receive a verification code.'}
        {step === 'code' && 'Enter the verification code sent to your email.'}
        {step === 'password' && 'Create a new password for your account.'}
      </p>

      {step === 'email' && (
        <form onSubmit={requestCode}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', top: '16px', left: '14px', color: '#777' }} />
              <input
                type="email"
                className="form-control"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? <><FaSpinner className="fa-spin" /> Sending...</> : 'Send Verification Code'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={verifyCode}>
          <div className="form-group">
            <label>Verification Code</label>
            <div style={{ position: 'relative' }}>
              <FaKey style={{ position: 'absolute', top: '16px', left: '14px', color: '#777' }} />
              <input
                type="text"
                className="form-control"
                placeholder="6-digit code"
                value={formData.code}
                onChange={e => updateField('code', e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
          </div>
          {devCode && (
            <p style={{ color: '#764ba2', fontWeight: 700, marginBottom: '1rem' }}>
              Development code: {devCode}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? <><FaSpinner className="fa-spin" /> Verifying...</> : 'Verify Code'}
          </button>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={resetPassword}>
          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', top: '16px', left: '14px', color: '#777' }} />
              <input
                type="password"
                className="form-control"
                placeholder="New password"
                value={formData.password}
                onChange={e => updateField('password', e.target.value)}
                style={{ paddingLeft: '42px' }}
                minLength="6"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', top: '16px', left: '14px', color: '#777' }} />
              <input
                type="password"
                className="form-control"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={e => updateField('confirmPassword', e.target.value)}
                style={{ paddingLeft: '42px' }}
                minLength="6"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {loading ? <><FaSpinner className="fa-spin" /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
        Remembered it?
        <Link to="/login" style={{ color: '#764ba2', fontWeight: '700', marginLeft: '6px' }}>
          Back to Login
        </Link>
      </p>
    </div>
  );
}
