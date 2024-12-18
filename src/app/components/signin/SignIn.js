import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignIn.css';
import toast, { Toaster } from 'react-hot-toast';

const SignIn = ({ setIsAuthenticated, setUserEmail, setUserName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const autoLogin = localStorage.getItem('autoLogin') === 'true';
    const loginType = localStorage.getItem('loginType');

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    if (autoLogin && loginType) {
      const savedEmail = localStorage.getItem('email');
      const savedName = localStorage.getItem('name');
      setIsAuthenticated(true);
      setUserEmail(savedEmail);
      setUserName(savedName || 'User');
      navigate('/');
    } else {
      localStorage.removeItem('email');
      localStorage.removeItem('loginType');
      setIsAuthenticated(false);
    }

    setIsAuthLoaded(true);
  }, [setIsAuthenticated, setUserEmail, setUserName, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const foundUser = registeredUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      setIsAuthenticated(true);
      localStorage.setItem('email', email);
      localStorage.setItem('loginType', 'local'); // 일반 로그인 저장

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('autoLogin', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('autoLogin', 'false');
      }

      toast.success('로그인 성공!');
      navigate('/');
    } else {
      setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
      toast.error('로그인 실패. 다시 시도해 주세요.');
    }
  };

  const handleKakaoLogin = () => {
    if (!window.Kakao?.isInitialized()) {
      window.Kakao.init('56295e10d97fc48ea7feac8a52d48be0'); // JavaScript 키 입력
    }

    window.Kakao.Auth.logout(() => {
      console.log('기존 세션 초기화 완료');

      window.Kakao.Auth.login({
        success: (authObj) => {
          window.Kakao.API.request({
            url: '/v2/user/me',
            success: (res) => {
              const { id, kakao_account } = res;
              const kakaoEmail = kakao_account.email || `kakao_user_${id}@kakao.com`;
              const kakaoName = kakao_account.profile?.nickname || 'Unknown';

              localStorage.setItem('email', kakaoEmail);
              localStorage.setItem('name', kakaoName);
              localStorage.setItem('loginType', 'kakao'); // 카카오 로그인 저장

              setIsAuthenticated(true);
              setUserEmail(kakaoEmail);
              setUserName(kakaoName);

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
    });
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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-image"></div>
      <div className="container">
        <div id="phone">
          <div id="content-wrapper">
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
                <button
                  type="button"
                  onClick={handleKakaoLogin}
                  className="kakao-login-button"
                >
                  <img src="/kakao-login-button.png" alt="카카오 로그인 버튼" />
                </button>
              </form>
              <a href="javascript:void(0)" onClick={toggleCard}>
                Don't have an account? <b>Sign up</b>
              </a>
            </div>
            <div className={`card ${isLoginVisible ? 'hidden' : ''}`} id="register">
              <form onSubmit={handleRegister}>
                <h1>Sign up</h1>
                <div className="input">
                  <input
                    type="email"
                    id="register-email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                  <label htmlFor="register-email">Email</label>
                </div>
                <div className="input">
                  <input
                    type="password"
                    id="register-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <label htmlFor="register-password">Password</label>
                </div>
                <div className="input">
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
              <a href="javascript:void(0)" onClick={toggleCard}>
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