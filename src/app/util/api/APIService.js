const API_KEY = '7bd1ba614e1eca467c9c659df3f40e8b'; // API 키
const baseUrl = 'https://api.themoviedb.org/3';

/**
 * 특정 카테고리와 필터링 조건에 따라 영화를 가져오는 함수
 * @param {string} category - 영화 카테고리
 * @param {object} filters - 필터링 조건 (장르, 정렬, 평점, 페이지)
 * @returns {array} - 영화 목록
 */
export const fetchMovies = async (category, filters = {}) => {
  const { genreId = '', sortBy = 'popularity.desc', minVote = -1, maxVote = 10, page = 1 } = filters;

  let url = '';

  switch (category) {
    case 'popular':
      url = `${baseUrl}/movie/popular?api_key=${API_KEY}&language=ko-KR&page=${page}`;
      break;
    case 'new_releases':
      url = `${baseUrl}/movie/now_playing?api_key=${API_KEY}&language=ko-KR&page=${page}`;
      break;
    default:
      url = `${baseUrl}/discover/movie?api_key=${API_KEY}&language=ko-KR&with_genres=${genreId}&sort_by=${sortBy}&vote_average.gte=${minVote}&vote_average.lte=${maxVote}&page=${page}`;
      break;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('API 요청 실패:', error);
    return [];
  }
};

/**
 * 영화 ID로 상세 정보를 가져오는 함수
 * @param {number} movieId - 영화 ID
 * @returns {object} - 영화 상세 정보
 */
export const fetchMovieDetails = async (movieId) => {
  try {
    const movieDetailsUrl = `${baseUrl}/movie/${movieId}?api_key=${API_KEY}&language=ko-KR`;
    const responseDetails = await fetch(movieDetailsUrl);
    const movieDetails = await responseDetails.json();

    const videoUrl = `${baseUrl}/movie/${movieId}/videos?api_key=${API_KEY}`;
    const responseVideos = await fetch(videoUrl);
    const videoData = await responseVideos.json();

    const trailer = videoData.results.find(video => video.type === 'Trailer');
    
    return { ...movieDetails, trailer };
  } catch (error) {
    console.error('영화 상세 정보 요청 실패:', error);
    return null;
  }
};
