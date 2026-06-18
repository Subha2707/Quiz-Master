// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWandMagicSparkles, FaSpinner } from 'react-icons/fa6';
import api from '../api/api';

const LEVEL_OPTIONS = {
  quick: 5,
  standard: 10,
  challenge: 20
};

export default function AdminPrompt() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state || {};
  const [formData, setFormData] = useState({
    title: config.title || 'AI Generated Quiz',
    durationMinutes: config.durationMinutes || 30,
    negativeMarkingWeight: config.negativeMarkingWeight || 0,
    level: config.level || 'standard',
    numQuestions: config.numQuestions || 10,
    sections: '',
    prompt: ''
  });
  const [loading, setLoading] = useState(false);

  const updateLevel = (level) => {
    setFormData(prev => ({
      ...prev,
      level,
      numQuestions: LEVEL_OPTIONS[level] || prev.numQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/quizzes/generate', formData);
      alert('AI Quiz Generated Successfully!');
      navigate(`/quiz/${res.data.quizId}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Failed to generate quiz. Ensure Groq API Key and Mongo are connected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '700px', margin: 'auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
        <FaWandMagicSparkles color="#764ba2" /> AI Quiz Generator
      </h2>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        Describe the topic, sections, difficulty, and any rules. The quiz settings from the previous page are already applied.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 300px' }}>
            <label>Quiz Title</label>
            <input type="text" className="form-control" placeholder="React Masterclass" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="form-group" style={{ flex: '1 1 100px' }}>
            <label>Duration (mins)</label>
            <input type="number" className="form-control" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label>Quiz Level</label>
            <select className="form-control" value={formData.level} onChange={e => updateLevel(e.target.value)} required>
              <option value="quick">Quick</option>
              <option value="standard">Standard</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label>Total Questions</label>
            <input type="number" className="form-control" value={formData.numQuestions} onChange={e => setFormData({...formData, numQuestions: e.target.value})} required />
          </div>
          <div className="form-group" style={{ flex: '1 1 150px' }}>
            <label>Negative Marking</label>
            <input type="number" step="0.1" className="form-control" value={formData.negativeMarkingWeight} onChange={e => setFormData({...formData, negativeMarkingWeight: e.target.value})} required />
          </div>
        </div>

        <div className="form-group">
          <label>Section Plan</label>
          <input
            type="text"
            className="form-control"
            placeholder="Example: Section 1 has 5 HTML questions, Section 2 has 5 CSS questions"
            value={formData.sections}
            onChange={e => setFormData({...formData, sections: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>AI Prompt Description</label>
          <textarea 
            className="form-control" 
            rows="5" 
            placeholder="Example: Generate a beginner-friendly web development quiz covering semantic HTML, CSS selectors, and basic JavaScript. Keep questions practical."
            value={formData.prompt} 
            onChange={e => setFormData({...formData, prompt: e.target.value})} 
            required
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }} disabled={loading}>
          {loading ? <><FaSpinner className="fa-spin" /> Generating...</> : <><FaWandMagicSparkles /> Generate Quiz</>}
        </button>
      </form>
    </div>
  );
}
