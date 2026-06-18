// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaArrowRight } from 'react-icons/fa';
import api from '../api/api';

export default function QuizArea() {
  const { quizId } = useParams();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const [quizRes, questionRes] = await Promise.all([
          api.get(`/quizzes/${quizId}`),
          api.get(`/quizzes/${quizId}/questions`)
        ]);
        setQuiz(quizRes.data);
        setQuestions(questionRes.data);
        setTimeLeft((quizRes.data.durationMinutes || 1) * 60);
      } catch (error) {
        console.error('Failed to load quiz:', error);
        alert(error.response?.data?.error || 'Failed to load quiz.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [loading, timeLeft]);

  // Back navigation and beforeunload protection
  useEffect(() => {
    if (loading || isSubmitted) return;

    window.history.pushState(null, null, window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      alert("To exit the quiz, please use the 'End Quiz' button.");
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
      return e.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loading, isSubmitted]);

  const submitQuiz = useCallback(async (overrideAnswers = null) => {
    if (isSubmitted) return;
    setIsSubmitted(true);

    try {
      const token = localStorage.getItem('token');

      // Build the final answers object (keyed by question _id)
      const finalAnswers = { ...(overrideAnswers || answers) };
      // Save the current question's selection if not already in overrideAnswers
      if (!overrideAnswers && selected !== null && questions[currentQ]) {
        finalAnswers[questions[currentQ]._id] = selected;
      }

      console.log("FINAL ANSWERS:", finalAnswers);
      await api.post(
        `/quizzes/${quizId}/submit`,
        {
          answers: finalAnswers,
          startTime: new Date(),
          endTime: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Quiz submitted successfully!');
      navigate('/leaderboard');
    } catch (error) {
      console.error(error);
      alert('Submission failed');
      setIsSubmitted(false);
    }
  }, [answers, currentQ, isSubmitted, navigate, questions, quizId, selected]);

  // Auto-submit when time is up
  useEffect(() => {
    if (!loading && timeLeft <= 0 && questions.length > 0 && !isSubmitted) {
      const autoSubmitTimer = setTimeout(() => {
        alert("Time's up! Auto-submitting your quiz.");
        const finalAnswers = { ...answers };
        if (selected !== null && questions[currentQ]) {
          finalAnswers[questions[currentQ]._id] = selected;
        }
        submitQuiz(finalAnswers);
      }, 0);

      return () => clearTimeout(autoSubmitTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, timeLeft, questions.length, isSubmitted, answers, selected, currentQ, submitQuiz]);

  const handleEndQuiz = () => {
    if (window.confirm("Are you sure you want to end the quiz? This will submit your current answers and exit.")) {
      const finalAnswers = { ...answers };
      if (selected !== null && questions[currentQ]) {
        finalAnswers[questions[currentQ]._id] = selected;
      }
      submitQuiz(finalAnswers);
    }
  };

  if (loading) {
    return <div className="glass-card" style={{ margin: 'auto' }}>Loading quiz...</div>;
  }

  if (!questions.length) {
    return (
      <div className="glass-card" style={{ margin: 'auto' }}>
        <h2>No questions found</h2>
        <p style={{ color: '#666', marginTop: '1rem' }}>This quiz exists, but it does not have generated questions yet.</p>
      </div>
    );
  }

  const q = questions[currentQ];
  const totalSeconds = (quiz?.durationMinutes || 1) * 60;
  const progressPercent = Math.max(0, (timeLeft / totalSeconds) * 100);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (showReview) {

    return (

      <div
        className="glass-card"
        style={{ margin: 'auto' }}
      >

        <h2
          style={{
            marginBottom: '2rem'
          }}
        >

          Review Your Answers

        </h2>

        {questions.map((q, index) => (

          <div
            key={q._id}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '14px',
              background:
                'rgba(255,255,255,0.5)'
            }}
          >

            <h4>
              Q{index + 1}.
              {q.questionText}
            </h4>

            <p
              style={{
                color: '#667eea',
                fontWeight: '600'
              }}
            >

              Selected:
              {answers[q._id] !== undefined

                ? q.options[answers[q._id]]

                : ' Not Answered'}

            </p>

          </div>

        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem'
          }}
        >

          <button
            className="btn-primary"
            onClick={() =>
              setShowReview(false)
            }
          >

            Back To Quiz

          </button>

          <button
            className="btn-primary"
            onClick={submitQuiz}
          >

            Final Submit

          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="glass-card" style={{ margin: 'auto' }}>
      <h2 style={{ marginBottom: '1rem' }}>{quiz?.title}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#555' }}>Question {currentQ + 1} of {questions.length}</span>
        <span style={{ fontWeight: 800, color: '#FF416C', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaClock /> {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      
      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {q.section && <p style={{ color: '#764ba2', fontWeight: 700, marginBottom: '0.75rem' }}>{q.section}</p>}
      <div className="question-text">{q.questionText}</div>
      
      <div className="options-grid">
        {q.options.map((opt, i) => (
          <button 
            key={i} 
            className={`option-btn ${selected === i ? 'selected' : ''}`}
            onClick={() => {
              setSelected(i);

              setAnswers(prev=>({
                ...prev,
                [q._id]: i
              }));
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem'
        }}
      >

      {/* PREVIOUS */}

        <button

          className="btn-primary"

          disabled={currentQ === 0}

          onClick={() => {

            const prevAnswers = { ...answers };

            if (selected !== null && questions[currentQ]) {
              prevAnswers[questions[currentQ]._id] = selected;
            }

            setAnswers(prevAnswers);

            const prevIndex = currentQ - 1;
            setCurrentQ(prevIndex);

            setSelected(
              prevAnswers[questions[prevIndex]?._id] ?? null
            );
          }}
        >

          Previous

        </button>

        {/* END QUIZ */}
        <button
          type="button"
          className="btn-secondary"
          onClick={handleEndQuiz}
          style={{
            background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            boxShadow: '0 4px 15px rgba(255, 65, 108, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          End Quiz
        </button>

      {/* NEXT / SUBMIT */}

        <button
          className="btn-primary"

          disabled={selected === null}

          onClick={() => {

            const nextAnswers = { ...answers };

            if (selected !== null && questions[currentQ]) {
              nextAnswers[questions[currentQ]._id] = selected;
            }

            setAnswers(nextAnswers);

            // LAST QUESTION

            if (currentQ === questions.length - 1) {

              setShowReview(true);

            }

            // NEXT QUESTION

            else {

              const nextIndex = currentQ + 1;
              setCurrentQ(nextIndex);

              setSelected(
                nextAnswers[questions[nextIndex]?._id] ?? null
              );
            }
          }}

          style={{

            display: 'flex',

            alignItems: 'center',

            gap: '10px'
          }}
        >

        {

          currentQ === questions.length - 1

            ? 'Review Answers'

            : 'Next Question'
        }

        <FaArrowRight />

      </button>

      </div>
    </div>
  );
}
