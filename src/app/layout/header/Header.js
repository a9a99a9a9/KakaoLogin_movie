import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faBars, faTimes, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = ({ setIsAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768); // 화면 크기 상태
  const navigate = useNavigate();

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

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setUserEmail(storedEmail);
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${storedEmail}`)) || [];
      setWishlistCount(storedWishlist.length);
    } else {
      setUserEmail(null);
      setWishlistCount(0);
    }
  }, [setIsAuthenticated]);

  const handleLogout = () => {
    // 로그아웃 시 이메일 정보와 Remember me 상태 처리
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const autoLogin = localStorage.getItem('autoLogin') === 'true';

    localStorage.removeItem('email'); // 현재 로그인된 이메일 제거
    localStorage.setItem('autoLogin', 'false'); // 자동 로그인 비활성화

    // Remember me가 활성화된 경우 이메일 유지
    if (!rememberedEmail || !autoLogin) {
      localStorage.removeItem('rememberedEmail');
    }

    // 인증 상태 초기화 및 로그인 페이지로 이동
    setIsAuthenticated(false);
    navigate('/signin');
  };

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
    </div>
  ) : null; // 로그인하지 않은 경우 헤더를 표시하지 않음
};

export default Header;
