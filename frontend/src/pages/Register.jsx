// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

      // Save token
      localStorage.setItem(
        'token',
        res.data.token
      );

      // Save user
      localStorage.setItem(
        'user',
        JSON.stringify(res.data.user)
      );

      // Update navbar
      window.dispatchEvent(
        new Event('auth-changed')
      );

      alert(
        res.data.message ||
        'Registration successful!'
      );

      navigate('/dashboard');

    } catch (error) {

      console.error(
        'Registration failed',
        error
      );

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to register'
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        maxWidth: '430px',
        margin: 'auto'
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}
      >
        Create Account
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            className="form-control"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) =>
              updateField(
                'name',
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>

          <input
            type="email"
            className="form-control"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) =>
              updateField(
                'email',
                e.target.value
              )
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              updateField(
                'password',
                e.target.value
              )
            }
            minLength="6"
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '100%',
            marginTop: '1rem'
          }}
          disabled={loading}
        >
          {
            loading
              ? 'Creating Account...'
              : 'Register'
          }
        </button>
      </form>

      <p
        style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: '#666'
        }}
      >
        Already have an account?

        <Link
          to="/login"
          style={{
            color: '#764ba2',
            fontWeight: '600',
            marginLeft: '5px'
          }}
        >
          Sign In here
        </Link>
      </p>
    </div>
  );
}