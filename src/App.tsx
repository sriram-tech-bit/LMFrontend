import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppLayout } from './components/AppLayout';
import { BooksPage } from './pages/BooksPage';
import { IssueBookPage } from './pages/IssueBookPage';
import { LoginPage } from './pages/LoginPage';
import { MemberHistoryPage } from './pages/MemberHistoryPage';
import { RegisterPage } from './pages/RegisterPage';

function ProtectedRoute() {
  const { token } = useAuth();
  const location = useLocation();
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/issue" element={<IssueBookPage />} />
          <Route path="/history" element={<MemberHistoryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
