import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useNotificationStore } from './lib/store';
import { mockUserAPI, mockNotificationAPI } from './lib/api-mock';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import MessagesPage from './pages/messages';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuthStore();
  const { setNotifications } = useNotificationStore();

  // useEffect(() => {
  //   const initApp = async () => {
  //     try {
  //       const user = await mockUserAPI.getCurrentUser();
  //       setUser(user);
  //       const notifs = await mockNotificationAPI.getNotifications();
  //       setNotifications(notifs);
  //     } catch (error) {
  //       console.log('No user logged in');
  //     }
  //   };
  //   initApp();
  // }, []);
  useEffect(() => {
    useAuthStore.getState().init();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <Register />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
