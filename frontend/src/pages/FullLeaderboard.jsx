// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import LoadingScreen from '../components/LoadingScreen';
import { FaArrowLeft, FaSearch, FaTrophy } from 'react-icons/fa';

export default function FullLeaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/results/leaderboard');
        setLeaders(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredLeaders = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return leaders.filter(user => {
      const name = String(user.name || '').toLowerCase();
      const quiz = String(user.quizTitle || '').toLowerCase();
      return name.includes(normalizedQuery) || quiz.includes(normalizedQuery);
    });
  }, [leaders, query]);

  if (loading) {
    return <LoadingScreen title="Loading Rankings" subtitle="Preparing the complete leaderboard..." />;
  }

  return (
    <div className="glass-card" style={{ margin: 'auto', maxWidth: '1180px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/leaderboard" style={{ color: '#764ba2', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <FaArrowLeft /> Back to Top 5
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaTrophy color="#d19b00" />
            All Rankings
          </h1>
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <FaSearch style={{ position: 'absolute', top: '15px', left: '14px', color: '#777' }} />
          <input
            className="form-control"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name or quiz"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      <p style={{ color: '#666', fontWeight: 700, marginBottom: '1rem' }}>
        Showing {filteredLeaders.length} of {leaders.length}
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Accuracy</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Skipped</th>
              <th>Played</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaders.map(user => {
              const rank = leaders.findIndex(item => item._id === user._id) + 1;
              return (
                <tr key={user._id}>
                  <td>#{rank}</td>
                  <td>{user.name}</td>
                  <td>{user.quizTitle}</td>
                  <td>{user.score}</td>
                  <td>{user.accuracy}%</td>
                  <td>{user.correctAnswers}</td>
                  <td>{user.wrongAnswers}</td>
                  <td>{user.unanswered}</td>
                  <td>{user.completedAt ? new Date(user.completedAt).toLocaleString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredLeaders.length === 0 && (
        <p style={{ color: '#666', marginTop: '1rem' }}>No ranking records match your search.</p>
      )}
    </div>
  );
}
