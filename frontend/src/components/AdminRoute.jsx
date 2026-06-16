import { Navigate } from 'react-router-dom';

const MAIN_ADMIN_EMAIL = 'deysubhadip66@gmail.com';

export default function AdminRoute({ children }) {
  const user = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.email?.toLowerCase() === MAIN_ADMIN_EMAIL;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}