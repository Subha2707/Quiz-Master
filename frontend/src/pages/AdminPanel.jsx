// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaPlusCircle, FaSpinner, FaUserShield } from 'react-icons/fa';
import api from '../api/api';

const MAIN_ADMIN_EMAIL = 'deysubhadip66@gmail.com';

export default function AdminPanel() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isMainAdmin = currentUser?.email?.toLowerCase() === MAIN_ADMIN_EMAIL;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    title: '',
    numQuestions: 10,
    durationMinutes: 30,
    negativeMarkingWeight: 0
  });

  useEffect(() => {
    if (!isMainAdmin) return;

    const loadUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || 'Failed to load users.');
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [isMainAdmin]);

  const updateConfig = (field, value) => {
    setQuizConfig(prev => ({ ...prev, [field]: value }));
  };

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', quizConfig.title || `Quiz from ${file.name}`);
    formData.append('numQuestions', quizConfig.numQuestions);
    formData.append('durationMinutes', quizConfig.durationMinutes);
    formData.append('negativeMarkingWeight', quizConfig.negativeMarkingWeight);

    try {
      const res = await api.post('/upload-questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Questions uploaded and parsed by AI successfully!');
      navigate(`/quiz/${res.data.quizId}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to process file. Ensure backend, MongoDB, and Groq API are set.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateClick = () => {
    if (!quizConfig.numQuestions || quizConfig.numQuestions < 1) {
      alert('Enter at least 1 question.');
      return;
    }

    navigate('/admin/generate', { state: quizConfig });
  };

  return (
    <div className="glass-card" style={{ margin: 'auto', maxWidth: '980px' }}>
      <h2>Admin Control Center</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Manage AI uploads, generate quizzes from scratch, and control admin access.</p>
      
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <FaCloudUploadAlt /> AI Bulk Upload with AI Parsing
        </h3>

        <div className="config-panel" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label>Quiz Title</label>
            <input type="text" className="form-control" placeholder="JavaScript Fundamentals" value={quizConfig.title} onChange={e => updateConfig('title', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>No. of Questions</label>
              <input type="number" min="1" className="form-control" value={quizConfig.numQuestions} onChange={e => updateConfig('numQuestions', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input type="number" min="1" className="form-control" value={quizConfig.durationMinutes} onChange={e => updateConfig('durationMinutes', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Negative Marking</label>
              <input type="number" min="0" step="0.25" className="form-control" value={quizConfig.negativeMarkingWeight} onChange={e => updateConfig('negativeMarkingWeight', e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.5)', padding: '2rem', borderRadius: '8px', border: '2px dashed rgba(118, 75, 162, 0.4)', textAlign: 'center', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
          <p style={{ marginBottom: '1rem', color: '#555' }}>Click to upload PDF, TXT, CSV, or JSON file</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload} 
            accept=".pdf,.txt,.csv,.json"
          />
          <button className="btn-secondary" disabled={loading}>
            {loading ? <FaSpinner className="fa-spin" /> : 'Browse Files'}
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#777', marginTop: '0.75rem' }}>AI will scan the file and create a quiz using the settings above.</p>
      </section>

      <section style={{ marginBottom: isMainAdmin ? '2rem' : 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaPlusCircle /> AI Quiz Generator from Scratch
        </h3>
        <p style={{ color: '#555', marginTop: '1rem', marginBottom: '1.5rem' }}>
          Create a new AI-generated quiz using a custom prompt, topic, sections, and rules.
        </p>
        <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleGenerateClick}>
          Open AI Quiz Generator
        </button>
      </section>

      {isMainAdmin && (
        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <FaUserShield /> Admin Panel Access
          </h3>

          {usersLoading ? (
            <p style={{ color: '#666' }}>Loading users...</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {users.map(user => {
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
                      background: 'rgba(255,255,255,0.55)',
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
          )}
        </section>
      )}
    </div>
  );
}
