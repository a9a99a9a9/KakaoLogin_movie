// src/util/movie/URL.js

export const getPopularMoviesURL = (apiKey) => {
    return `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=ko-KR`;
  };
  