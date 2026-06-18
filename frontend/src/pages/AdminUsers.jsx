// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/api';
import LoadingScreen from '../components/LoadingScreen';
import { FaArrowLeft, FaSearch, FaUserShield } from 'react-icons/fa';

const MAIN_ADMIN_EMAIL = 'deysubhadip66@gmail.com';

export default function AdminUsers() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isMainAdmin = currentUser?.email?.toLowerCase() === MAIN_ADMIN_EMAIL;
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isMainAdmin) return;

    const loadUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isMainAdmin]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return users.filter(user => {
      const name = String(user.name || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [query, users]);

  const updateUserRole = async (userId, role) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(user => (
        user._id === userId ? { ...user, role: res.data.user.role } : user
      )));
      alert(res.data.message);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to update admin access.');
    }
  };

  if (!isMainAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (loading) {
    return <LoadingScreen title="Loading Users" subtitle="Preparing admin access controls..." />;
  }

  return (
    <div className="glass-card" style={{ margin: 'auto', maxWidth: '1080px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <Link to="/admin" style={{ color: '#764ba2', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
            <FaArrowLeft /> Back to Admin Panel
          </Link>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaUserShield />
            Admin Access Users
          </h1>
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <FaSearch style={{ position: 'absolute', top: '15px', left: '14px', color: '#777' }} />
          <input
            className="form-control"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search users"
            style={{ paddingLeft: '42px' }}
          />
        </div>
      </div>

      <p style={{ color: '#666', fontWeight: 700, marginBottom: '1rem' }}>
        Showing {filteredUsers.length} of {users.length}
      </p>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {filteredUsers.map(user => {
          const isMainAdminUser = user.email === MAIN_ADMIN_EMAIL;
          return (
            <div
              key={user._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.58)',
                border: '1px solid rgba(255,255,255,0.8)',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <strong>{user.name}</strong>
                <p style={{ color: '#666', margin: '0.25rem 0 0' }}>{user.email}</p>
              </div>
              <button
                type="button"
                className={user.role === 'ADMIN' ? 'btn-secondary' : 'btn-primary'}
                disabled={isMainAdminUser}
                onClick={() => updateUserRole(user._id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
              >
                {isMainAdminUser ? 'Main Admin' : user.role === 'ADMIN' ? 'Remove Admin' : 'Give Admin Access'}
              </button>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <p style={{ color: '#666', marginTop: '1rem' }}>No users match your search.</p>
      )}
    </div>
  );
}
