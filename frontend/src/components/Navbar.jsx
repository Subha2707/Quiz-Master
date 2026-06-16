// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import {

  FaGraduationCap,
  FaHome,
  FaTachometerAlt,
  FaTrophy,
  FaUserShield,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes

} from 'react-icons/fa';

const MAIN_ADMIN_EMAIL = 'deysubhadip66@gmail.com';

export default function Navbar() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [user, setUser] = useState(

    () =>
      JSON.parse(
        localStorage.getItem('user')
        || 'null'
      )
  );

  useEffect(() => {

    const syncUser = () => {

      setUser(

        JSON.parse(
          localStorage.getItem('user')
          || 'null'
        )
      );
    };

    window.addEventListener(
      'auth-changed',
      syncUser
    );

    window.addEventListener(
      'storage',
      syncUser
    );

    return () => {

      window.removeEventListener(
        'auth-changed',
        syncUser
      );

      window.removeEventListener(
        'storage',
        syncUser
      );
    };

  }, []);

  const handleLogout = () => {

    localStorage.removeItem('token');

    localStorage.removeItem('user');

    window.dispatchEvent(
      new Event('auth-changed')
    );

    navigate('/login');
  };

  return (

    <header className="header">

      {/* LOGO */}

      <Link

        to="/"

        style={{

          textDecoration: 'none',

          display: 'flex',

          alignItems: 'center',

          gap: '10px'
        }}
      >

        <FaGraduationCap
          size={28}
          color="#FF416C"
        />

        <h1
          style={{
            margin: 0,
            fontSize: '1.8rem',
            fontWeight: '900',
            background:
              'linear-gradient(90deg,#FF416C,#764ba2,#23a6d5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          QuizMaster
        </h1>

      </Link>

      {/* HAMBURGER */}

      <button

        className="menu-btn"

        onClick={() =>
          setMenuOpen(!menuOpen)
        }
      >

        {

          menuOpen

            ? <FaTimes />

            : <FaBars />
        }

      </button>

      {/* NAVIGATION */}

      <nav

        className={`nav-links ${
          menuOpen ? 'active' : ''
        }`}
      >

        <Link to="/">
          <FaHome />
          Home
        </Link>

        <Link to="/dashboard">
          <FaTachometerAlt />
          Dashboard
        </Link>

        <Link to="/leaderboard">
          <FaTrophy />
          Leaderboard
        </Link>

        {(user?.role === 'ADMIN' || user?.email?.toLowerCase() === MAIN_ADMIN_EMAIL) && (
          <Link to="/admin">
            <FaUserShield />
            Admin
          </Link>
        )}

        {user ? (

          <div className="user-actions">

            <span className="username">
              {user.name}
            </span>

            <button
              type="button"
              className="btn-secondary"

              onClick={handleLogout}
            >

              <FaSignOutAlt />

              Logout

            </button>

          </div>

        ) : (

          <div className="user-actions">

            <Link
              to="/login"
              className="btn-secondary"
            >

              <FaSignInAlt />

              Login

            </Link>

            <Link
              to="/register"
              className="btn-primary"
            >

              <FaUserPlus />

              Register

            </Link>

          </div>
        )}

      </nav>

    </header>
  );
}
