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

  // 카카오 SDK 초기화
  useEffect(() => {
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY); // 환경 변수에서 카카오 JS 키 가져오기
      console.log('Kakao SDK Initialized');
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      // localStorage에서 이메일을 가져와 인증 상태 관리
      const email = localStorage.getItem('email');
      setIsAuthenticated(!!email); // 이메일이 존재하면 인증됨
    };

    // 로컬 스토리지 변경 감지 및 인증 상태 초기화
    window.addEventListener('storage', checkAuth);
    checkAuth(); // 앱 시작 시 로컬 스토리지 확인

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

  // 인증되지 않으면 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children;
};

export default App;
