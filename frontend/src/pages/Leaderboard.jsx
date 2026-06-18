// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import LoadingScreen from '../components/LoadingScreen';
import {
  FaChartLine,
  FaCrown,
  FaMedal,
  FaSearch,
  FaStar,
  FaTrophy,
  FaUsers
} from 'react-icons/fa';

const medalForRank = (rank) => {
  if (rank === 1) return <FaCrown color="#d19b00" />;
  if (rank === 2) return <FaMedal color="#8f9aa8" />;
  if (rank === 3) return <FaMedal color="#b87533" />;
  return <FaStar color="#764ba2" />;
};

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

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
    return leaders.filter(user => String(user.name || '').toLowerCase().includes(normalizedQuery));
  }, [leaders, query]);

  const topThree = leaders.slice(0, 3);
  const topScore = leaders[0]?.score || 0;
  const averageAccuracy = leaders.length
    ? Math.round(leaders.reduce((sum, user) => sum + (user.accuracy || 0), 0) / leaders.length)
    : 0;

  if (loading) {
    return <LoadingScreen title="Loading Leaderboard" subtitle="Calculating ranks and podium results..." />;
  }

  return (
    <div className="glass-card" style={{ margin: 'auto', maxWidth: '1120px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}
      >
        <div>
          <p style={{ color: '#764ba2', fontWeight: 800, marginBottom: '0.5rem' }}>Global rankings</p>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaTrophy color="#d19b00" />
            Leaderboard
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <p style={{ color: '#666', fontWeight: 700 }}>
            Showing {filteredLeaders.length} of {leaders.length}
          </p>
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <FaSearch style={{ position: 'absolute', top: '15px', left: '14px', color: '#777' }} />
            <input
              className="form-control"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name"
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button type="button" className="btn-secondary" onClick={() => setQuery('')}>
            Reset
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 0, marginBottom: '2rem' }}>
        {[
          { icon: <FaUsers />, label: 'Ranked Players', value: leaders.length, color: '#667eea' },
          { icon: <FaTrophy />, label: 'Top Score', value: topScore, color: '#d19b00' },
          { icon: <FaChartLine />, label: 'Average Accuracy', value: `${averageAccuracy}%`, color: '#23a6d5' }
        ].map(item => (
          <div key={item.label} className="stat-card" style={{ borderRadius: '8px' }}>
            <div style={{ color: item.color, fontSize: '1.8rem', marginBottom: '0.75rem' }}>{item.icon}</div>
            <h2>{item.value}</h2>
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      {leaders.length === 0 ? (
        <div className="stat-card" style={{ borderRadius: '8px' }}>
          <FaTrophy color="#d19b00" size={30} style={{ marginBottom: '0.75rem' }} />
          <h3>No results yet</h3>
          <p style={{ color: '#666' }}>Complete a quiz to appear on the leaderboard.</p>
        </div>
      ) : (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            {topThree.map((user, index) => {
              const rank = index + 1;
              return (
                <article
                  key={user._id}
                  style={{
                    background: rank === 1 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    borderRadius: '8px',
                    padding: '1.4rem',
                    textAlign: 'center',
                    boxShadow: rank === 1 ? '0 14px 30px rgba(209,155,0,0.18)' : '0 10px 24px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{medalForRank(rank)}</div>
                  <p style={{ color: '#764ba2', fontWeight: 800, marginBottom: '0.35rem' }}>Rank #{rank}</p>
                  <h3 style={{ marginBottom: '0.5rem' }}>{user.name}</h3>
                  <h2 style={{ color: '#667eea' }}>{user.score}</h2>
                  <p style={{ color: '#666' }}>Accuracy {user.accuracy}%</p>
                </article>
              );
            })}
          </section>

          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaders.map((user, index) => {
                  const originalRank = leaders.findIndex(item => item._id === user._id) + 1;
                  const isCurrentUser = currentUser?.name === user.name;
                  return (
                    <tr
                      key={user._id}
                      style={{
                        background: isCurrentUser ? 'rgba(118,75,162,0.12)' : undefined,
                        fontWeight: isCurrentUser ? 800 : 600
                      }}
                    >
                      <td>#{originalRank || index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.score}</td>
                      <td>{user.accuracy}%</td>
                      <td>{originalRank <= 3 ? 'Podium' : isCurrentUser ? 'You' : 'Challenger'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLeaders.length === 0 && (
            <p style={{ color: '#666', marginTop: '1rem' }}>No players match your search.</p>
          )}
        </>
      )}
    </div>
  );
}
