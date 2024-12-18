import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import toast, { Toaster } from 'react-hot-toast';

const SignIn = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // 인증 상태 로드 여부 추가
  const navigate = useNavigate();

  const TMDB_API_KEY = '7bd1ba614e1eca467c9c659df3f40e8b'; // TMDB API Key

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const autoLogin = localStorage.getItem('autoLogin') === 'true';

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    if (autoLogin) {
      const savedEmail = localStorage.getItem('email');
      if (savedEmail) {
        setIsAuthenticated(true);
        navigate('/');
      }
    } else {
      // Remember me가 체크되지 않은 경우 로그아웃 처리
      localStorage.removeItem('email');
      setIsAuthenticated(false);
    }

    // 인증 상태 로드 완료 설정
    setIsAuthLoaded(true);
  }, [setIsAuthenticated, navigate]);

  const fetchTMDBToken = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/authentication/token/new?api_key=${TMDB_API_KEY}`
      );
      const data = await response.json();
      if (!data.success) throw new Error('TMDB 토큰 요청 실패');
      return data.request_token;
    } catch (error) {
      toast.error('TMDB API 오류 발생');
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const foundUser = registeredUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      const token = await fetchTMDBToken();
      if (token) {
        setIsAuthenticated(true);
        localStorage.setItem('email', email);

        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('autoLogin', 'true');
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.setItem('autoLogin', 'false');
        }

        toast.success('로그인 성공!');
        navigate('/');
      }
    } else {
      setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
      toast.error('로그인 실패. 다시 시도해 주세요.');
    }
  };

  const toggleCard = () => {
    setIsLoginVisible(!isLoginVisible);
    setErrorMessage('');
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!isTermsChecked) {
      setErrorMessage('약관에 동의해야 회원가입이 가능합니다.');
      return;
    }

    if (!isValidEmail(registerEmail)) {
      setErrorMessage('유효한 이메일 주소를 입력하세요.');
      return;
    }

    if (!registerPassword || !confirmPassword) {
      setErrorMessage('모든 필드를 입력해 주세요.');
      return;
    }

    if (registerPassword !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const isEmailTaken = registeredUsers.some((user) => user.email === registerEmail);

    if (isEmailTaken) {
      setErrorMessage('이미 사용 중인 이메일입니다.');
      return;
    }

    const newUser = { email: registerEmail, password: registerPassword };
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

    setErrorMessage('');
    toast.success('회원가입이 완료되었습니다. 이제 로그인하세요!');
    toggleCard();
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (!isAuthLoaded) {
    // 인증 상태 로드 중일 때 로딩 상태 표시
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-image"></div>
      <div className="container">
        <div id="phone">
          <div id="content-wrapper">
            {/* 로그인 폼 */}
            <div className={`card ${isLoginVisible ? '' : 'hidden'}`} id="login">
              <form onSubmit={handleLogin}>
                <h1>Sign in</h1>
                <div className="input">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Username or Email</label>
                </div>
                <div className="input">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Password</label>
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <span className="checkbox remember">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="remember">Remember me</label>
                </span>
                <button type="submit" disabled={!email || !password || !isValidEmail(email)}>
                  Login
                </button>
              </form>
              <a href="javascript:void(0)" className="account-check" onClick={toggleCard}>
                Don't have an account? <b>Sign up</b>
              </a>
            </div>

            {/* 회원가입 폼 */}
            <div className={`card ${isLoginVisible ? 'hidden' : ''}`} id="register">
              <form onSubmit={handleRegister}>
                <h1>Sign up</h1>
                <div className="input">
                  <input
                    type="email"
                    id="register-email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Email"
                  />
                  <label htmlFor="register-email">Email</label>
                </div>
                <div className="input">
                  <input
                    type="password"
                    id="register-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Password"
                  />
                  <label htmlFor="register-password">Password</label>
                </div>
                <div className="input">
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                  />
                  <label htmlFor="confirm-password">Confirm Password</label>
                </div>
                <span className="checkbox terms">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={isTermsChecked}
                    onChange={() => setIsTermsChecked(!isTermsChecked)}
                  />
                  <label htmlFor="terms">I have read the Terms and Conditions</label>
                </span>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <button type="submit">Register</button>
              </form>
              <a href="javascript:void(0)" className="account-check" onClick={toggleCard}>
                Already have an account? <b>Sign in</b>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
