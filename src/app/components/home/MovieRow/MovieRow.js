import React, { useState, useEffect } from "react";
import './MovieRow.css';

function MovieRow({ title, movies: initialMovies, fetchMovies, onPosterClick, onPosterClickRecommended }) {
  const [movies, setMovies] = useState(initialMovies); // 초기 movies 사용
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 새로운 카테고리일 때 초기화
    setMovies(initialMovies);
    setPage(1);
  }, [initialMovies]);

  useEffect(() => {
    // 추가 페이지 로드
    const loadMovies = async () => {
      if (page > 1) { // 페이지 1 이상일 때 추가 로드
        setLoading(true);
        const newMovies = await fetchMovies(page); // fetchMovies에 page 전달
        setMovies((prevMovies) => [...prevMovies, ...newMovies]);
        setLoading(false);
      }
    };

    loadMovies();
  }, [page, fetchMovies]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="movie-row" onScroll={handleScroll}>
      <h2>{title}</h2>
      <div className="movie-row__posters">
        {movies.length === 0 ? (
          <p>Loading...</p>
        ) : (
          movies.map((movie) => (
            <div 
              key={movie.id} 
              className="movie-row__poster" 
              onClick={() => {
                onPosterClick(movie); // 클릭 시 openModal 호출
                if (onPosterClickRecommended) {
                  onPosterClickRecommended(movie); // 추천 영화 목록에 추가/삭제
                }
              }}
            >
              <img
                src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                alt={movie.title}
              />
            </div>
          ))
        )}
      </div>
      {loading && <p>Loading more movies...</p>}
    </div>
  );
}

export default MovieRow;
