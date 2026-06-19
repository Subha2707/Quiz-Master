// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import QuizArea from './pages/QuizArea';
import Leaderboard from './pages/Leaderboard';
import FullLeaderboard from './pages/FullLeaderboard';
import AdminPanel from './pages/AdminPanel';
import AdminUsers from './pages/AdminUsers';

import AdminPrompt from './pages/AdminPrompt';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const LAST_ACTIVITY_KEY = 'lastActivityAt';


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isQuizPage = location.pathname.startsWith('/quiz/');

  useEffect(() => {
    const getToken = () => localStorage.getItem('token');

    const logoutInactiveUser = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/login', { replace: true });
    };

    const ensureActivityStart = () => {
      if (getToken() && !localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      }
    };

    const checkInactivity = () => {
      if (!getToken()) {
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        return false;
      }

      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
      if (!lastActivity) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        return false;
      }

      if (Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        logoutInactiveUser();
        return true;
      }

      return false;
    };

    const markActivity = () => {
      if (!checkInactivity() && getToken()) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      }
    };

    ensureActivityStart();

    const activityEvents = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, markActivity);
    });

    const intervalId = window.setInterval(checkInactivity, 1000);

    return () => {
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, markActivity);
      });
      window.clearInterval(intervalId);
    };
  }, [navigate]);

  return (
    <div className="app-container">
      {!isQuizPage && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <ProtectedRoute>
                <QuizArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard/all"
            element={
              <ProtectedRoute>
                <FullLeaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/generate"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPrompt />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isQuizPage && <Footer />}
    </div>
  );
}

export default App;
