// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';

import {
  useNavigate,
  Link
} from 'react-router-dom';

import api from '../api/api';

import {
  FaEnvelope,
  FaLock,
  FaSignInAlt
} from 'react-icons/fa';

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({

      email: '',
      password: ''
    });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      try {
        const userObj = JSON.parse(loggedInUser);
        if (userObj && userObj.email) {
          if (userObj.email.toLowerCase().trim() === formData.email.toLowerCase().trim()) {
            alert('Already logged in');
            navigate('/dashboard');
            return;
          } else {
            alert('First logout from this account');
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    setLoading(true);
    try {

      const res = await api.post(

        '/auth/login',

        formData
      );

      // SAVE TOKEN

      localStorage.setItem(

        'token',

        res.data.token
      );

      // SAVE USER

      localStorage.setItem(

        'user',

        JSON.stringify(
          res.data.user
        )
      );

      // AUTH EVENT

      window.dispatchEvent(
        new Event('auth-changed')
      );

      alert(
        'Login successful!'
      );

      navigate('/dashboard');

    } catch (error) {

      console.error(error);

      alert(

        error.response?.data?.message ||

        error.response?.data?.error ||

        'Login failed'
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div

      className="glass-card"

      style={{

        maxWidth: '450px',

        margin: 'auto',

        padding: '2.5rem'
      }}
    >

      <h1

        style={{

          textAlign: 'center',

          marginBottom: '10px'
        }}
      >

        Welcome Back!

      </h1>

      <p

        style={{

          textAlign: 'center',

          color: '#777',

          marginBottom: '2rem'
        }}
      >

        Login to continue your quizzes

      </p>

      <form onSubmit={handleSubmit}>

        {/* EMAIL */}

        <div className="form-group">

          <label>Email Address</label>

          <div
            style={{
              position: 'relative'
            }}
          >

            <FaEnvelope
              style={{
                position: 'absolute',
                top: '16px',
                left: '14px',
                color: '#777'
              }}
            />

            <input

              type="email"

              name="email"

              className="form-control"

              placeholder="john@example.com"

              value={formData.email}

              onChange={handleChange}

              style={{
                paddingLeft: '42px'
              }}

              required
            />

          </div>

        </div>

        {/* PASSWORD */}

        <div className="form-group">

          <label>Password</label>

          <div
            style={{
              position: 'relative'
            }}
          >

            <FaLock
              style={{
                position: 'absolute',
                top: '16px',
                left: '14px',
                color: '#777'
              }}
            />

            <input

              type="password"

              name="password"

              className="form-control"

              placeholder="Password"

              value={formData.password}

              onChange={handleChange}

              style={{
                paddingLeft: '42px'
              }}

              required
            />

          </div>

        </div>

        <div style={{ textAlign: 'right', marginTop: '-0.75rem' }}>
          <Link
            to="/forgot-password"
            style={{
              color: '#764ba2',
              fontWeight: '700',
              fontSize: '0.95rem',
              textDecoration: 'none'
            }}
          >
            Forgot password?
          </Link>
        </div>

        {/* BUTTON */}

        <button

          type="submit"

          className="btn-primary"

          disabled={loading}

          style={{

            width: '100%',

            marginTop: '1.5rem',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            gap: '10px'
          }}
        >

          <FaSignInAlt />

          {

            loading

              ? 'Signing In...'

              : 'Sign In'
          }

        </button>

      </form>

      {/* REGISTER */}

      <p

        style={{

          textAlign: 'center',

          marginTop: '1.5rem',

          color: '#666'
        }}
      >

        Don't have an account?

        <Link

          to="/register"

          style={{

            color: '#764ba2',

            fontWeight: '700',

            marginLeft: '6px'
          }}
        >

          Register

        </Link>

      </p>

    </div>
  );
}
