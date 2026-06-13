
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LandingPage from './pages/LandingPage';
import LoginSignup from './pages/Login';
import ContentPage from './pages/ContentPage';
import MainLayout from './pages/MainLayout';
import type { RootState } from './store/store';
import { useEffect, useState } from 'react';
import { setUser } from './store/authSlice';
import api from './utils/api';
import SharePage from './pages/SharePage';
import { AskBrain } from './components/AskBrain';

const App = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get("/profile");
        dispatch(setUser(res.data));
      } catch (error) {
        console.log(error);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuthStatus();
  }, [dispatch]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2" style={{ borderColor: 'rgba(15,23,42,0.1)', borderBottomColor: '#0f172a' }}></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/auth"
        element={user ? <Navigate to="/content" /> : <LoginSignup />}
      />

      <Route
        path="/content"
        element={user ? <MainLayout>{(filter) => filter === "chat" ? <AskBrain /> : <ContentPage activeFilter={filter} />}</MainLayout> : <Navigate to="/auth" />}
      />

      <Route path="/share/:shareId" element={<SharePage />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;