// src/components/home/Banner/Banner.js
import React from 'react';
import './Banner.css'; // Banner 스타일

function Banner({ movie }) {
  return (
    <div className="banner">
      <h1>{movie?.title}</h1>
      {/* 추가적으로 영화 관련 데이터를 렌더링하는 로직 */}
    </div>
  );
}

export default Banner;
