const API_KEY = 'a1d35d73b7f5e434f27691373d396b89';
const API_URL = 'https://api.themoviedb.org/3';

let genres = [];

// Инициализация
async function init() {
    await loadGenres();
    setupEventListeners();
}

// Загрузка жанров
async function loadGenres() {
    try {
        const response = await fetch(`${API_URL}/genre/movie/list?api_key=${API_KEY}&language=ru-RU`);
        const data = await response.json();
        genres = data.genres;
        
        // Заполнение выпадающего списка жанров
        const genreSelect = document.getElementById('genreFilter');
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка при загрузке жанров:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const moviesGrid = document.getElementById('moviesGrid');
    const movieDetails = document.getElementById('movieDetails');
    const closeDetails = document.createElement('div');
    closeDetails.className = 'close-details';
    closeDetails.textContent = '×';
    movieDetails.appendChild(closeDetails);

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    closeDetails.addEventListener('click', () => {
        movieDetails.style.display = 'none';
    });

    moviesGrid.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            const movieId = movieCard.dataset.id;
            showMovieDetails(movieId);
        }
    });
}

// Выполнение поиска
async function performSearch() {
    const searchInput = document.getElementById('searchInput').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const genreFilter = document.getElementById('genreFilter').value;

    try {
        const response = await fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchInput)}&language=ru-RU`);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Ошибка при поиске фильмов:', error);
        alert('Произошла ошибка при поиске фильмов. Попробуйте еще раз.');
    }
}

// Отображение фильмов
function displayMovies(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    moviesGrid.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.dataset.id = movie.id;

        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                 alt="${movie.title}" 
                 onerror="this.src='https://via.placeholder.com/200x300?text=No+Poster'">
            <div class="movie-card-info">
                <h3 class="movie-card-title">${movie.title}</h3>
                <p class="movie-card-year">${new Date(movie.release_date).getFullYear()}</p>
            </div>
        `;

        moviesGrid.appendChild(movieCard);
    });
}

// Показ деталей фильма
async function showMovieDetails(movieId) {
    try {
        const response = await fetch(`${API_URL}/movie/${movieId}?api_key=${API_KEY}&language=ru-RU`);
        const movie = await response.json();

        const movieDetails = document.getElementById('movieDetails');
        const moviePoster = document.getElementById('moviePoster');
        const movieTitle = document.getElementById('movieTitle');
        const movieOverview = document.getElementById('movieOverview');
        const movieYear = document.getElementById('movieYear');
        const movieGenres = document.getElementById('movieGenres');
        const movieRating = document.getElementById('movieRating');

        moviePoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieTitle.textContent = movie.title;
        movieOverview.textContent = movie.overview;
        movieYear.textContent = new Date(movie.release_date).getFullYear();
        
        // Получение названий жанров на русском
        const genreNames = movie.genre_ids
            .map(id => genres.find(g => g.id === id))
            .map(g => g ? g.name : '')
            .join(', ');
        movieGenres.textContent = genreNames;
        
        movieRating.textContent = `${movie.vote_average}/10`;

        movieDetails.style.display = 'flex';
    } catch (error) {
        console.error('Ошибка при загрузке деталей фильма:', error);
        alert('Произошла ошибка при загрузке деталей фильма.');
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);
