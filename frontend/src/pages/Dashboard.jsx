// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import LoadingScreen from '../components/LoadingScreen';
import {
  FaBookOpen,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaFire,
  FaPlayCircle,
  FaSearch,
  FaSortAmountDown,
  FaTrophy
} from 'react-icons/fa';

const difficultyFromCount = (count = 0) => {
  if (count <= 5) return 'Quick';
  if (count <= 15) return 'Standard';
  return 'Challenge';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizRes = await api.get('/quizzes');
        setQuizzes(quizRes.data);

        const statsRes = await api.get('/results/my-stats');
        setStats(statsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredQuizzes = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    const result = quizzes.filter(quiz => {
      const count = quiz.questionCount || 0;
      const matchesQuery = String(quiz.title || '').toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'quick' && count <= 5) ||
        (filter === 'standard' && count > 5 && count <= 15) ||
        (filter === 'challenge' && count > 15);

      return matchesQuery && matchesFilter;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'duration') return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      if (sortBy === 'questions') return (b.questionCount || 0) - (a.questionCount || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [filter, query, quizzes, sortBy]);

  const recommendedQuiz = filteredQuizzes[0] || quizzes[0];
  const completionTarget = Math.max((stats?.quizzesTaken || 0) + 3, 3);
  const progressPercent = Math.min(100, Math.round(((stats?.quizzesTaken || 0) / completionTarget) * 100));

  if (loading) {
    return <LoadingScreen title="Loading Dashboard" subtitle="Fetching quizzes, stats, and progress..." />;
  }

  return (
    <div className="glass-card" style={{ margin: 'auto', width: '100%', maxWidth: '1200px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 1fr) minmax(240px, 360px)',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
      >
        <div>
          <p style={{ color: '#764ba2', fontWeight: 800, marginBottom: '0.5rem' }}>
            {user?.name ? `Welcome back, ${user.name}` : 'Welcome back'}
          </p>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>Learning Dashboard</h1>
          <p style={{ color: '#666', lineHeight: 1.7 }}>
            Continue a quiz, improve your average score, and keep climbing the leaderboard.
          </p>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg,#667eea,#764ba2)',
            borderRadius: '8px',
            padding: '1.25rem',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
          }}
        >
          <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>Progress Goal</p>
          <h2 style={{ color: 'white', marginBottom: '0.75rem' }}>{progressPercent}%</h2>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.25)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', background: 'white' }} />
          </div>
          <p style={{ marginTop: '0.75rem', opacity: 0.9 }}>
            {stats?.quizzesTaken || 0} of {completionTarget} practice sessions completed.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        {[
          { icon: <FaCheckCircle />, label: 'Quizzes Taken', value: stats?.quizzesTaken || 0, color: '#667eea' },
          { icon: <FaChartLine />, label: 'Average Accuracy', value: `${stats?.averageScore || 0}%`, color: '#764ba2' },
          { icon: <FaTrophy />, label: 'Global Rank', value: stats?.rank ? `#${stats.rank}` : '-', color: '#d19b00' },
          { icon: <FaFire />, label: 'Day Streak', value: stats?.streak || 0, color: '#FF416C' }
        ].map(item => (
          <div key={item.label} className="stat-card" style={{ borderRadius: '8px' }}>
            <div style={{ color: item.color, fontSize: '1.8rem', marginBottom: '0.75rem' }}>{item.icon}</div>
            <h2>{item.value}</h2>
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      {recommendedQuiz && (
        <section
          style={{
            marginTop: '2rem',
            background: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: '8px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <p style={{ color: '#764ba2', fontWeight: 800, marginBottom: '0.35rem' }}>Recommended next</p>
            <h2 style={{ marginBottom: '0.5rem' }}>{recommendedQuiz.title}</h2>
            <p style={{ color: '#666' }}>
              {recommendedQuiz.questionCount || 0} questions, {recommendedQuiz.durationMinutes || 0} minutes,
              {` ${difficultyFromCount(recommendedQuiz.questionCount)}`} mode
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate(`/quiz/${recommendedQuiz._id}`)}>
            <FaPlayCircle style={{ marginRight: '8px' }} />
            Start Recommended
          </button>
        </section>
      )}

      <section style={{ marginTop: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}
        >
          <h2>Available Quizzes</h2>
          <p style={{ color: '#666', fontWeight: 700 }}>
            Showing {filteredQuizzes.length} of {quizzes.length}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '230px' }}>
              <FaSearch style={{ position: 'absolute', top: '15px', left: '14px', color: '#777' }} />
              <input
                className="form-control"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search quizzes"
                style={{ paddingLeft: '42px' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <FaFilter style={{ position: 'absolute', top: '15px', left: '14px', color: '#777' }} />
              <select className="form-control" value={filter} onChange={e => setFilter(e.target.value)} style={{ paddingLeft: '42px' }}>
                <option value="all">All levels</option>
                <option value="quick">Quick</option>
                <option value="standard">Standard</option>
                <option value="challenge">Challenge</option>
              </select>
            </div>
            <div style={{ position: 'relative' }}>
              <FaSortAmountDown style={{ position: 'absolute', top: '15px', left: '14px', color: '#777' }} />
              <select className="form-control" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ paddingLeft: '42px' }}>
                <option value="newest">Newest</option>
                <option value="duration">Shortest</option>
                <option value="questions">Most questions</option>
              </select>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setQuery('');
                setFilter('all');
                setSortBy('newest');
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="stat-card" style={{ borderRadius: '8px' }}>
            <FaBookOpen color="#764ba2" size={28} style={{ marginBottom: '0.75rem' }} />
            <h3>No matching quizzes</h3>
            <p style={{ color: '#666' }}>Try another search or filter.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredQuizzes.map(quiz => (
              <article
                key={quiz._id}
                style={{
                  background: 'rgba(255,255,255,0.58)',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <h3>{quiz.title}</h3>
                  <span style={{ color: '#764ba2', fontWeight: 800 }}>{difficultyFromCount(quiz.questionCount)}</span>
                </div>

                <div style={{ display: 'grid', gap: '0.55rem', color: '#555', marginBottom: '1.25rem' }}>
                  <span><FaClock style={{ marginRight: '8px' }} />{quiz.durationMinutes || 0} minutes</span>
                  <span><FaBookOpen style={{ marginRight: '8px' }} />{quiz.questionCount || 0} questions</span>
                  <span>Negative marking: -{quiz.negativeMarkingWeight || 0}</span>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => navigate(`/quiz/${quiz._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <FaPlayCircle />
                  Start Quiz
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
