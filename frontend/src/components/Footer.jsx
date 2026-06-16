// eslint-disable-next-line no-unused-vars
import React from 'react';

import {

  FaHeart,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaGraduationCap,
  FaHome,
  FaTrophy,
  FaUserShield,
  FaEnvelope,

} from 'react-icons/fa';

import { Link } from 'react-router-dom';

export default function Footer() {

  return (

    <footer

      className="footer glass-card"

      style={{

        marginTop: '4rem',

        borderRadius: '28px 28px 0 0',

        padding: '3rem 2rem',

        width: '100%',

        maxWidth: '100%'
      }}
    >

      {/* TOP */}

      <div

        style={{

          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(250px,1fr))',

          gap: '2rem',

          marginBottom: '2rem'
        }}
      >

        {/* BRAND */}

        <div>

          <div

            style={{

              display: 'flex',

              alignItems: 'center',

              gap: '10px',

              marginBottom: '1rem'
            }}
          >

            <FaGraduationCap
              size={28}
              color="#FF416C"
            />

            <h2

              style={{

                background:
                  'linear-gradient(90deg,#FF416C,#764ba2,#23a6d5)',

                WebkitBackgroundClip: 'text',

                WebkitTextFillColor:
                  'transparent'
              }}
            >

              QuizMaster

            </h2>

          </div>

          <p
            style={{
              color: '#555',
              lineHeight: '1.7'
            }}
          >

            AI-powered online quiz platform
            with secure assessments,
            leaderboard rankings,
            analytics, and smart MCQ generation.

          </p>

        </div>

        {/* QUICK LINKS */}

        <div>

          <h3
            style={{
              marginBottom: '1rem'
            }}
          >

            Quick Links

          </h3>

          <div

            style={{

              display: 'flex',

              flexDirection: 'column',

              gap: '12px'
            }}
          >

            <Link
              to="/"
              className="footer-link"
            >

              <FaHome />

              Home

            </Link>

            <Link
              to="/dashboard"
              className="footer-link"
            >

              <FaGraduationCap />

              Dashboard

            </Link>

            <Link
              to="/leaderboard"
              className="footer-link"
            >

              <FaTrophy />

              Leaderboard

            </Link>

            <Link
              to="/admin"
              className="footer-link"
            >

              <FaUserShield />

              Admin Panel

            </Link>

          </div>

        </div>

        {/* CONTACT */}

        <div>

          <h3
            style={{
              marginBottom: '1rem'
            }}
          >

            Contact

          </h3>

          <p
            style={{
              color: '#555',
              marginBottom: '1rem'
            }}
          >

            <FaEnvelope />

            support@quizmaster.ai

          </p>

          {/* SOCIALS */}

          <div

            style={{

              display: 'flex',

              gap: '1rem',

              marginTop: '1rem'
            }}
          >

            <a
              href="https://github.com/Subha2707"
              className="social-icon"
            >

              <FaGithub />

            </a>

            <a
              href="https://www.instagram.com/dreaming_sane"
              className="social-icon"
            >

              <FaInstagram />

            </a>

            <a
              href="https://www.linkedin.com/in/subhadip-dey-7019632b7"
              className="social-icon"
            >

              <FaLinkedin />

            </a>

          </div>

        </div>

      </div>

      {/* BOTTOM */}

      <div

        style={{

          borderTop:
            '1px solid rgba(0,0,0,0.08)',

          paddingTop: '1.5rem',

          textAlign: 'center'
        }}
      >

        <p

          style={{

            color: '#666',

            margin: 0,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            gap: '6px',

            flexWrap: 'wrap'
          }}
        >

          Built with

          <FaHeart color="#FF416C" />

          by Subha • QuizMaster © 2026

        </p>

      </div>

    </footer>
  );
}