import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from './MovieRow/MovieRow';
import MovieModal from './movie-modal/MovieModal';
import './Home.css';
import { fetchMovies } from '../../util/api/APIService';
import { CSSTransition } from 'react-transition-group';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 장르 ID를 명확히 설정
const categories = [
  { key: 'popular', title: '인기 영화' },
  { key: 'new_releases', title: '최신 영화' },
  { key: 'action', title: '액션 영화', genreId: '28' },
  { key: 'comedy', title: '코미디 영화', genreId: '35' },
  { key: 'drama', title: '드라마 영화', genreId: '18' },
  { key: 'horror', title: '공포 영화', genreId: '27' },
  { key: 'romance', title: '로맨스 영화', genreId: '10749' },
  { key: 'sci_fi', title: 'SF 영화', genreId: '878' },
  { key: 'thriller', title: '스릴러 영화', genreId: '53' },
];

function Home() {
  const [movies, setMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  const navigate = useNavigate();
  const currentUserEmail = localStorage.getItem('email');

  useEffect(() => {
    if (!currentUserEmail) {
      navigate('/signin');
      return;
    }

    setLoading(true);
    setError(null);

    const fetchAllMovies = async () => {
      try {
        const results = await Promise.all(
          categories.map(({ key, genreId }) =>
            fetchMovies(key === 'popular' || key === 'new_releases' ? key : 'discover', {
              genreId: genreId || '',
              sortBy: 'popularity.desc',
            })
          )
        );

        const moviesByCategory = categories.reduce((acc, { key }, index) => {
          acc[key] = shuffleArray(results[index]);
          return acc;
        }, {});

        setMovies(moviesByCategory);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('영화를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    fetchAllMovies();

    const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUserEmail}`)) || [];
    const storedRecommendedMovies = JSON.parse(localStorage.getItem(`recommendedMovies_${currentUserEmail}`)) || [];

    setWishlist(storedWishlist);
    setRecommendedMovies(storedRecommendedMovies);
  }, [currentUserEmail, navigate]);

  const openModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addToWishlist = () => {
    if (selectedMovie && !wishlist.some((movie) => movie.id === selectedMovie.id)) {
      const newWishlist = [...wishlist, selectedMovie];
      setWishlist(newWishlist);
      localStorage.setItem(`wishlist_${currentUserEmail}`, JSON.stringify(newWishlist));
      closeModal();
    }
  };

  const toggleRecommendedMovie = (movie) => {
    const updatedRecommendedMovies = recommendedMovies.some((m) => m.id === movie.id)
      ? recommendedMovies.filter((m) => m.id !== movie.id)
      : [...recommendedMovies, movie];

    setRecommendedMovies(updatedRecommendedMovies);
    localStorage.setItem(`recommendedMovies_${currentUserEmail}`, JSON.stringify(updatedRecommendedMovies));
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="home">
      <CSSTransition
        in={isModalOpen}
        timeout={500}
        classNames="modal"
        unmountOnExit
      >
        <MovieModal
          movie={selectedMovie}
          onClose={closeModal}
          onAddToWishlist={addToWishlist}
        />
      </CSSTransition>

      <div className="recommended-movies">
        <h2>추천 영화</h2>
        <div className="movie-row-container">
          {recommendedMovies.map((movie) => (
            <div key={movie.id} className="movie-poster" onClick={() => toggleRecommendedMovie(movie)}>
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
              <p>{movie.title}</p>
            </div>
          ))}
        </div>
      </div>

      {categories.map(({ key, title }) => (
        <div key={key} className="movie-row">
          <h2>{title}</h2>
          <div className="movie-row-container">
            <MovieRow
              movies={movies[key] || []}
              fetchMovies={(page) =>
                fetchMovies(key === 'popular' || key === 'new_releases' ? key : 'discover', {
                  genreId: categories.find((c) => c.key === key)?.genreId || '',
                  sortBy: 'popularity.desc',
                  page,
                })
              }
              onPosterClick={openModal}
              onPosterClickRecommended={toggleRecommendedMovie}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home;
