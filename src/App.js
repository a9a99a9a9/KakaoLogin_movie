import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './app/components/home/Home';
import SignIn from './app/components/signin/SignIn';
import Popular from './app/components/home/popular/Popular';
import Search from './app/components/home/search/Search';
import Wishlist from './app/components/home/wishlist/Wishlist';
import Header from './app/layout/header/Header'; // Header 컴포넌트 경로

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const email = localStorage.getItem('email');
      setIsAuthenticated(!!email);
    };

    // 로컬 스토리지 변경 감지 및 인증 상태 초기화
    window.addEventListener('storage', checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      {/* 로그인 상태일 때만 Header 렌더링 */}
      {isAuthenticated && <Header setIsAuthenticated={setIsAuthenticated} />}
      <Routes>
        {/* 보호된 경로 */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/popular"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Popular />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        {/* 로그인 경로 */}
        <Route
          path="/signin"
          element={<SignIn setIsAuthenticated={setIsAuthenticated} />}
        />
        {/* 기본 경로 처리 */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/' : '/signin'} replace />}
        />
      </Routes>
    </Router>
  );
};

// 보호된 경로 컴포넌트
const ProtectedRoute = ({ isAuthenticated, children }) => {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
};

export default App;
