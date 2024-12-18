import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import MovieModal from '../movie-modal/MovieModal'; // 모달 컴포넌트 import
import './Search.css';
import { fetchMovies, fetchMovieDetails } from '../../../util/api/APIService'; // fetchMovieDetails 추가

const Search = () => {
  const [genreId, setGenreId] = useState(''); // 기본 장르
  const [minVote, setMinVote] = useState(0); // 기본 최소 평점
  const [maxVote, setMaxVote] = useState(10); // 기본 최대 평점
  const [sortId, setSortId] = useState('popularity.desc'); // 기본 정렬
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null); // 선택된 영화 정보 저장
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  const currentUserEmail = localStorage.getItem('email'); // 현재 사용자 이메일 가져오기

  useEffect(() => {
    fetchMoviesData(); // 초기 영화 데이터 로드
  }, [genreId, minVote, maxVote, sortId, page]);

  useEffect(() => {
    const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUserEmail}`)) || [];
    const storedRecommendedMovies = JSON.parse(localStorage.getItem(`recommendedMovies_${currentUserEmail}`)) || [];

    setWishlist(storedWishlist);
    setRecommendedMovies(storedRecommendedMovies);
  }, [currentUserEmail]);

  const fetchMoviesData = async () => {
    try {
      const data = await fetchMovies('discover', {
        genreId,
        sortBy: sortId,
        minVote,
        maxVote,
        page,
      });

      if (data.length > 0) {
        setMovies((prevMovies) => {
          const allMovies = [...prevMovies, ...data];
          const uniqueMovies = Array.from(new Map(allMovies.map((movie) => [movie.id, movie])).values());
          return uniqueMovies;
        });
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('영화 데이터 로드 실패:', error);
    }
  };

  const loadMoreMovies = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    if (name === 'genre') setGenreId(value);
    else if (name === 'age') {
      switch (value) {
        case '9':
          setMinVote(9);
          setMaxVote(10);
          break;
        case '8':
          setMinVote(8);
          setMaxVote(9);
          break;
        case '7':
          setMinVote(7);
          setMaxVote(8);
          break;
        case '6':
          setMinVote(6);
          setMaxVote(7);
          break;
        case '5':
          setMinVote(5);
          setMaxVote(6);
          break;
        case '4':
          setMinVote(4);
          setMaxVote(5);
          break;
        case '0':
          setMinVote(0);
          setMaxVote(4);
          break;
        default:
          setMinVote(0);
          setMaxVote(10);
          break;
      }
    } else if (name === 'sort') setSortId(value);

    setPage(1); // 페이지와 영화 목록 초기화
    setMovies([]);
  };

  const resetFilters = () => {
    setGenreId('');
    setMinVote(0);
    setMaxVote(10);
    setSortId('popularity.desc');
    setPage(1);
    setMovies([]);

    // 필터링 선택 UI 초기화
    document.querySelector('[name="genre"]').value = '';
    document.querySelector('[name="age"]').value = '-1';
    document.querySelector('[name="sort"]').value = 'popularity.desc';
  };

  const openModal = async (movieId) => {
    try {
      const movieDetails = await fetchMovieDetails(movieId);
      setSelectedMovie(movieDetails);

      // 추천 영화에 자동 등록
      toggleRecommendedMovie(movieDetails);

      setIsModalOpen(true);
    } catch (error) {
      console.error('영화 상세 정보 로드 실패:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const addToWishlist = () => {
    if (selectedMovie && !wishlist.some((movie) => movie.id === selectedMovie.id)) {
      const newWishlist = [...wishlist, selectedMovie];
      setWishlist(newWishlist);
      localStorage.setItem(`wishlist_${currentUserEmail}`, JSON.stringify(newWishlist)); // 사용자별 찜 목록 저장
    }
    closeModal();
  };

  const toggleRecommendedMovie = (movie) => {
    const updatedRecommendedMovies = [...recommendedMovies];
    const index = updatedRecommendedMovies.findIndex((m) => m.id === movie.id);

    if (index > -1) {
      updatedRecommendedMovies.splice(index, 1); // 이미 존재하면 제거
    } else {
      updatedRecommendedMovies.push(movie); // 없으면 추가
    }

    setRecommendedMovies(updatedRecommendedMovies);
    localStorage.setItem(`recommendedMovies_${currentUserEmail}`, JSON.stringify(updatedRecommendedMovies));
  };

  return (
    <div className="search-container">
      <h1>영화 검색</h1>
      <div className="search-filters">
        {/* 장르 필터 */}
        <select name="genre" onChange={handleSearchChange}>
          <option value="">장르 (전체)</option>
          <option value="28">액션</option>
          <option value="12">모험</option>
          <option value="16">애니메이션</option>
          <option value="35">코미디</option>
          <option value="80">범죄</option>
          <option value="18">드라마</option>
          <option value="27">공포</option>
          <option value="53">스릴러</option>
          <option value="10749">로맨스</option>
        </select>
        {/* 평점 필터 */}
        <select name="age" onChange={handleSearchChange}>
          <option value="-1">평점 (전체)</option>
          <option value="9">9~10</option>
          <option value="8">8~9</option>
          <option value="7">7~8</option>
          <option value="6">6~7</option>
          <option value="5">5~6</option>
          <option value="4">4~5</option>
          <option value="0">4점 이하</option>
        </select>
        {/* 정렬 필터 */}
        <select name="sort" onChange={handleSearchChange}>
          <option value="popularity.desc">인기순</option>
          <option value="vote_average.desc">평점순</option>
          <option value="release_date.desc">최신순</option>
        </select>
        <button onClick={resetFilters} className="reset-button">
          초기화
        </button>
      </div>

      <InfiniteScroll
        dataLength={movies.length}
        next={loadMoreMovies}
        hasMore={hasMore}
        loader={<h4>로딩 중...</h4>}
        endMessage={<p>더 이상 영화가 없습니다.</p>}
      >
        <div className="movie-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-item" onClick={() => openModal(movie.id)}>
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
              <h3>{movie.title}</h3>
            </div>
          ))}
        </div>
      </InfiniteScroll>

      {isModalOpen && selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={closeModal}
          onAddToWishlist={addToWishlist}
        />
      )}
    </div>
  );
};

export default Search;
