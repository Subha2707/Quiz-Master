// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowRight,
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaLayerGroup,
  FaRocket,
  FaShieldAlt,
  FaTrophy,
  FaUsers
} from 'react-icons/fa';

const highlights = [
  { icon: <FaBrain />, title: 'AI Quiz Creation', text: 'Generate structured MCQs from prompts or uploaded study material.' },
  { icon: <FaClock />, title: 'Timed Practice', text: 'Attempt quizzes with duration controls and focused exam-style flow.' },
  { icon: <FaChartLine />, title: 'Live Progress', text: 'Track accuracy, rank, score history, and completion signals.' },
  { icon: <FaShieldAlt />, title: 'Admin Controls', text: 'Protect quiz generation and admin access with role-based permissions.' }
];

const workflow = [
  'Choose an available quiz',
  'Answer inside the protected quiz area',
  'Submit and compare your score',
  'Return to improve your ranking'
];

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div style={{ width: '100%', maxWidth: '1180px' }}>
      <section
        className="glass-card"
        style={{
          margin: 'auto',
          maxWidth: '1180px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}
      >
        <div>
          <p style={{ color: '#764ba2', fontWeight: 800, marginBottom: '0.75rem' }}>
            AI-powered quiz platform
          </p>
          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', lineHeight: 1.08, marginBottom: '1rem' }}>
            QuizMaster
          </h1>
          <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            Create, attempt, and analyze quizzes in one place with AI generation, secure admin tools,
            leaderboard competition, and learner-focused progress tracking.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <FaRocket />
              {user ? 'Go to Dashboard' : 'Start Learning'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/leaderboard')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <FaTrophy />
              View Leaderboard
            </button>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: '8px',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { label: 'Quiz generation modes', value: '2', icon: <FaLayerGroup /> },
              { label: 'Assessment flow', value: 'Secure', icon: <FaShieldAlt /> },
              { label: 'Results tracking', value: 'Live', icon: <FaChartLine /> }
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.7)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontWeight: 700 }}>
                  {item.icon}
                  {item.label}
                </span>
                <strong style={{ color: '#764ba2' }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem'
        }}
      >
        {highlights.map(feature => (
          <div key={feature.title} className="stat-card" style={{ textAlign: 'left', borderRadius: '8px' }}>
            <div style={{ color: '#764ba2', fontSize: '1.8rem', marginBottom: '0.8rem' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>{feature.text}</p>
          </div>
        ))}
      </section>

      <section
        className="glass-card"
        style={{
          margin: '2rem auto 0',
          maxWidth: '1180px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem'
        }}
      >
        <div>
          <h2 style={{ marginBottom: '1rem' }}>A Better Quiz Routine</h2>
          <p style={{ color: '#666', lineHeight: 1.7 }}>
            QuizMaster is built around a simple loop: practice, review, improve, and compete.
            The interface keeps quizzes easy to start while giving admins enough control to create better assessments.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {workflow.map((step, index) => (
            <div
              key={step}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0.9rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.65)'
              }}
            >
              <FaCheckCircle color="#23a6d5" />
              <span style={{ fontWeight: 700 }}>{index + 1}. {step}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Open Quiz Dashboard <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>
          <button className="btn-secondary" onClick={() => navigate('/login')}>
            Sign In to Continue
          </button>
          <div style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
            <FaUsers color="#764ba2" />
            <span>Built for students, educators, and quiz administrators.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
