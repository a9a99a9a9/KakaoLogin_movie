// src/util/movie/URLService.js
class URLService {
    getURL4PopularMovies(apiKey) {
      return `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`;
    }
  
    getURL4ReleaseMovies(apiKey) {
      return `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`;
    }
  
    getURL4GenreMovies(apiKey, genreId) {
      return `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}`;
    }
  
    async fetchFeaturedMovie(apiKey) {
      const response = await fetch(`https://api.themoviedb.org/3/movie/550?api_key=${apiKey}`);
      const data = await response.json();
      return data;
    }
  }
  
  export default URLService;
  