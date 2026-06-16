// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState('register');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', code: '' });
  const [devCode, setDevCode] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (localStorage.getItem('token')) {
      alert('First logout from this account');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setDevCode(res.data.devCode || '');
      alert(res.data.message);
      setStep('verify');
    } catch (error) {
      console.error('Registration failed', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to register. Ensure backend and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-registration', {
        email: formData.email,
        code: formData.code
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-changed'));
      alert('Email verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Verification failed', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to verify email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '430px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {step === 'register' ? 'Create Account' : 'Verify Email'}
      </h2>

      {step === 'register' && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe" value={formData.name} onChange={e => updateField('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="john@example.com" value={formData.email} onChange={e => updateField('email', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="Password" value={formData.password} onChange={e => updateField('password', e.target.value)} minLength="6" required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Sending Code...' : 'Register'}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify}>
          <p style={{ color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>
            Enter the verification code sent to {formData.email}.
          </p>
          <div className="form-group">
            <label>Verification Code</label>
            <input type="text" className="form-control" placeholder="6-digit code" value={formData.code} onChange={e => updateField('code', e.target.value)} required />
          </div>
          {devCode && (
            <p style={{ color: '#764ba2', fontWeight: 700, marginBottom: '1rem' }}>
              Development code: {devCode}
            </p>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify and Continue'}
          </button>
          <button type="button" className="btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setStep('register')}>
            Edit Details
          </button>
        </form>
      )}

      <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
        Already have an account? <Link to="/login" style={{ color: '#764ba2', fontWeight: '600' }}>Sign In here</Link>
      </p>
    </div>
  );
}
