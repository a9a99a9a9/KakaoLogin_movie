// src/app/components/movie-modal/MovieModal.js
import React from 'react';
import './MovieModal.css'; // 스타일 파일 추가

function MovieModal({ movie, onClose, onAddToWishlist }) {
  if (!movie) return null;

  return (
    <div className="movie-modal">
      <div className="movie-modal__content">
        <span className="movie-modal__close" onClick={onClose}>
          &times;
        </span>
        <div className="movie-modal__image">
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        </div>
        <div className="movie-modal__details">
          <h2>{movie.title}</h2>
          <p><strong>개봉일:</strong> {movie.release_date}</p>
          <p><strong>평점:</strong> {movie.vote_average} / 10</p>
          <p><strong>줄거리:</strong> {movie.overview}</p>
          {/* 장르 정보 표시 */}
          {movie.genres && (
            <p><strong>장르:</strong> {movie.genres.map((genre) => genre.name).join(', ')}</p>
          )}
          <button onClick={onAddToWishlist}>찜하기</button>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;
