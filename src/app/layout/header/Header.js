import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faBars, faTimes, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import './Header.css';

const Header = ({ setIsAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);  // 사용자 이름 상태 추가
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768); 
  const navigate = useNavigate();

  // 새로고침 후 로그인 상태를 복원하는 부분
  useEffect(() => {
    const storedEmail = localStorage.getItem('email'); 
    const storedName = localStorage.getItem('name'); // 이름도 가져오기
    if (storedEmail) {
      setUserEmail(storedEmail);
      setUserName(storedName); // 이름 상태 설정
      const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${storedEmail}`)) || [];
      setWishlistCount(storedWishlist.length);
      setIsAuthenticated(true);
    } else {
      setUserEmail(null);
      setUserName(null); // 로그인 상태가 아니면 null
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated]);

  // 화면 크기 변경 시 상태 업데이트
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768); 

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize); 
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleKakaoLogin = () => {
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init('56295e10d97fc48ea7feac8a52d48be0'); 
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            const { id, kakao_account } = res;
            const kakaoEmail = kakao_account.email || `kakao_user_${id}@kakao.com`;
            const kakaoName = kakao_account.profile?.nickname || 'Unknown';
            const kakaoProfileId = id;

            localStorage.setItem('email', kakaoEmail);
            localStorage.setItem('name', kakaoName); // 이름을 localStorage에 저장
            localStorage.setItem('profileId', kakaoProfileId); 

            setUserEmail(kakaoEmail); 
            setUserName(kakaoName); // 로그인 후 이름 업데이트

            setIsAuthenticated(true);
            toast.success('카카오 로그인 성공!');
            navigate('/');
          },
          fail: (error) => {
            console.error('카카오 사용자 정보 요청 실패:', error);
            toast.error('카카오 로그인 중 오류가 발생했습니다.');
          },
        });
      },
      fail: (err) => {
        console.error('카카오 로그인 실패:', err);
        toast.error('카카오 로그인 실패');
      },
    });
  };

  const handleLogout = () => {
    if (window.Kakao?.isInitialized()) {
      // 앱과 사용자 연결 해제
      window.Kakao.API.request({
        url: '/v1/user/unlink',
        success: () => {
          // localStorage와 상태 초기화
          localStorage.removeItem('email');
          localStorage.removeItem('name');
          localStorage.removeItem('profileId'); // 프로필 ID도 삭제
          setUserEmail(null);
          setUserName(null);
          setIsAuthenticated(false);
  
          toast.success('로그아웃 성공!');
          navigate('/signin');
        },
        fail: (error) => {
          console.error('카카오 로그아웃 실패:', error);
          toast.error('로그아웃 중 오류가 발생했습니다.');
        },
      });
    } else {
      toast.error('카카오가 초기화되지 않았습니다.');
    }
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
          {/* 이메일이 있으면 이메일을, 이름이 있으면 이름을 표시 */}
          <span className="user-email" style={userName ? { writingMode: 'horizontal-tb' } : {}}>
            {userName || userEmail}
          </span>

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

      <ToastContainer /> 
    </div>
  ) : (
    <div className="header-login">
      <button onClick={handleKakaoLogin}>카카오톡으로 로그인</button>
    </div>
  ); 
};

export default Header;
