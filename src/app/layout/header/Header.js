import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faBars, faTimes, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify'; // 추가: toast 및 ToastContainer 임포트
import 'react-toastify/dist/ReactToastify.css'; // Toastify 스타일 임포트
import './Header.css';

const Header = ({ setIsAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768); // 화면 크기 상태
  const navigate = useNavigate();

  // 새로고침 후 로그인 상태를 복원하는 부분
  useEffect(() => {
    const storedEmail = localStorage.getItem('email'); // localStorage에서 이메일 정보 확인
    if (storedEmail) {
      setUserEmail(storedEmail); // 이메일이 있으면 로그인 상태로 복원
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${storedEmail}`)) || [];
      setWishlistCount(storedWishlist.length);
      setIsAuthenticated(true); // 인증 상태 설정
    } else {
      setUserEmail(null); // 로그인 상태가 아니면 null
      setIsAuthenticated(false); // 인증 상태를 false로 설정
    }
  }, [setIsAuthenticated]);

  // 화면 크기 변경 시 상태 업데이트
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768); // 화면 크기 변경 시 상태 업데이트

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize); // 화면 크기 변경 이벤트 추가
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize); // 이벤트 제거
    };
  }, []);

  // 카카오 로그인 처리
  const handleKakaoLogin = () => {
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init('56295e10d97fc48ea7feac8a52d48be0'); // 여기에 JavaScript 키를 입력하세요
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            const { id, kakao_account } = res;
            const kakaoEmail = kakao_account.email || `kakao_user_${id}@kakao.com`;

            // 로그인 성공 시 이메일을 localStorage에 저장
            localStorage.setItem('email', kakaoEmail);
            setUserEmail(kakaoEmail); // 사용자 이메일 상태 업데이트
            setIsAuthenticated(true);
            toast.success('카카오 로그인 성공!'); // toast 알림 표시
            navigate('/');
          },
          fail: (error) => {
            console.error('카카오 사용자 정보 요청 실패:', error);
            toast.error('카카오 로그인 중 오류가 발생했습니다.'); // toast 알림 표시
          },
        });
      },
      fail: (err) => {
        console.error('카카오 로그인 실패:', err);
        toast.error('카카오 로그인 실패'); // toast 알림 표시
      },
    });
  };

  // 로그아웃 처리
  const handleLogout = () => {
    // 카카오 로그아웃 처리
    window.Kakao.Auth.logout(() => {
      // 로그아웃 후 로컬 스토리지에서 이메일 정보 삭제
      localStorage.removeItem('email');
      setUserEmail(null);
      setIsAuthenticated(false);
      toast.success('로그아웃 성공!'); // toast 알림 표시
      navigate('/signin'); // 로그인 페이지로 리다이렉트
    });
  };

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return userEmail ? (
    <div id="container">
      <header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-left">
          <div className="logo">
            <Link to="/">
              <FontAwesomeIcon icon={faTicketAlt} style={{ color: '#E50914' }} />
            </Link>
          </div>
          <nav className="nav-links desktop-nav">
            <ul>
              <li><Link to="/">홈</Link></li>
              <li><Link to="/popular">대세 콘텐츠</Link></li>
              <li><Link to="/wishlist">내가 찜한 리스트</Link></li>
              <li><Link to="/search">찾아보기</Link></li>
            </ul>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-email">{userEmail}</span>

          {/* 로그아웃 버튼과 아이콘을 화면 크기에 따라 표시 */}
          {!isSmallScreen ? (
            <button className="icon-button logout-button" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} /> 로그아웃
            </button>
          ) : (
            <button className="icon-button logout-icon" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          )}

          <button className="icon-button mobile-menu-button" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="close-button" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <nav>
          <ul>
            <li><Link to="/" onClick={toggleMobileMenu}>홈</Link></li>
            <li><Link to="/popular" onClick={toggleMobileMenu}>대세 콘텐츠</Link></li>
            <li><Link to="/wishlist" onClick={toggleMobileMenu}>내가 찜한 리스트</Link></li>
            <li><Link to="/search" onClick={toggleMobileMenu}>찾아보기</Link></li>
          </ul>
        </nav>
      </div>

      <ToastContainer /> {/* 알림 표시를 위한 ToastContainer 추가 */}
    </div>
  ) : (
    <div className="header-login">
      <button onClick={handleKakaoLogin}>카카오톡으로 로그인</button>
    </div>
  ); // 로그인하지 않은 경우 로그인 버튼 표시
};

export default Header;
