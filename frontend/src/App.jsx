// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import AdminPanel from './pages/AdminPanel';

// import AdminPrompt from './pages/AdminPrompt';

// const MAIN_ADMIN_EMAIL = 'deysubhadip66@gmail.com';

// function AdminRoute({ children }) {
//   const user = JSON.parse(localStorage.getItem('user') || 'null');

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user.role !== 'ADMIN' && user.email?.toLowerCase() !== MAIN_ADMIN_EMAIL) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// }

function App() {
  const location = useLocation();
  const isQuizPage = location.pathname.startsWith('/quiz/');

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
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
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
        </Routes>
      </main>
      {!isQuizPage && <Footer />}
    </div>
  );
}

export default App;
