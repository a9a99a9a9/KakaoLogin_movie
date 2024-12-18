import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18 이상에서는 'react-dom/client'로 가져옵니다.
import './index.css';
import App from './App';

// 'root' ID를 가진 DOM 요소를 찾고 렌더링
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); // React 18 방식으로 root 생성
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('React root element not found!');
}
