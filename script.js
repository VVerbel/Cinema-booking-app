document.addEventListener('DOMContentLoaded', () => {
        const loginContainer = document.getElementById('login-container');
        const adminPanel = document.getElementById('admin-panel');
        const moviesList = document.getElementById('movies-list');
        const reservationScreen = document.getElementById('reservation-screen');
        const moviesContainer = document.getElementById('movies-container');
        const seatsContainer = document.getElementById('seats-container');
        const movieTitleDisplay = document.getElementById('movie-title-display');
        const movieImageDisplay = document.getElementById('movie-image-display');
        const reserveBtn = document.getElementById('reserve-btn');
        const deleteReservationBtn = document.getElementById('delete-reservation-btn');
        const addMovieBtn = document.getElementById('add-movie-btn');

        let userRole = '';
        let selectedMovie = null;

        document.getElementById('login-admin').addEventListener('click', () => {
            userRole = 'admin';
            loginContainer.classList.add('hidden');
            loginContainer.classList.remove('d-flex');
            adminPanel.classList.remove('hidden');
            moviesList.classList.remove('hidden');
            loadMovies();
        });

        document.getElementById('login-user').addEventListener('click', () => {
            userRole = 'user';
            loginContainer.classList.add('hidden');
            loginContainer.classList.remove('d-flex');
            moviesList.classList.add('hidden');
            moviesList.classList.remove('hidden');
            loadMovies();
        });

        addMovieBtn.addEventListener('click', () => {
            if (userRole === 'admin') {
                const title = document.getElementById('movie-title').value;
                const image = document.getElementById('movie-image').value;
                const seats = document.getElementById('movie-seats').value;

                if (title && image && seats) {
                    const movie = {title, image, seats: parseInt(seats), reservedSeats: []};
                    addMovieToLocalStorage(movie);
                    addMovieToDOM(movie);
                }
            }
        });

        reserveBtn.addEventListener('click', () => {
            const selectedSeats = seatsContainer.querySelectorAll('.seat.selected');
            selectedSeats.forEach(seat => {
                seat.classList.remove('selected');
                seat.classList.add('reserved');
            });
            updateMovieSeatsInLocalStorage(selectedMovie.title, getReservedSeats());
        });

        deleteReservationBtn.addEventListener('click', () => {
            console.log({userRole})
            if (userRole === 'admin') {
                const reservedSeats = seatsContainer.querySelectorAll('.seat.reserved');
                reservedSeats.forEach(seat => seat.classList.remove('reserved'));
                updateMovieSeatsInLocalStorage(selectedMovie.title, [])
            } else {
                alert('Only admin can delete reservations');
            }
        });
        function addMovieToLocalStorage(movie) {
            const movies = JSON.parse(localStorage.getItem('movies')) || [];
            movies.push(movie);
            localStorage.setItem('movies', JSON.stringify(movies));
        }
        function loadMovies() {
            const movies = JSON.parse(localStorage.getItem('movies')) || [];
            moviesContainer.innerHTML = '';
            movies.forEach(movie => addMovieToDOM(movie));
        }
        function addMovieToDOM(movie) {
            const movieDiv = document.createElement('div');
            movieDiv.className = 'movie';
            movieDiv.innerHTML = `
            <h3>${movie.title}</h3>
            <img src="${movie.image}" alt="${movie.title}" style="width: 100px; height: 150px;">
            <p>Seats Available: <span class="seats">${movie.seats - movie.reservedSeats.length}</span></p>
            <button class="select-movie-btn select">Select</button>
            ${userRole === 'admin' ? '<button class="delete-movie-btn select">Delete Movie</button>' : ''}
        `;
            moviesContainer.appendChild(movieDiv);

            movieDiv.querySelector('.select-movie-btn').addEventListener('click', () => {
                selectedMovie = movie;
                showReservationScreen();
            });

            if (userRole === 'admin') {
                movieDiv.querySelector('.delete-movie-btn').addEventListener('click', () => {
                    movieDiv.remove();
                    deleteMovieFromLocalStorage(movie.title);
                });
            }
        }
        function showReservationScreen() {
            adminPanel.classList.add('hidden');
            moviesList.classList.add('hidden');
            moviesContainer.classList.add('hidden');
            moviesContainer.classList.remove('d-flex');
            reservationScreen.classList.remove('hidden');
            movieTitleDisplay.textContent = selectedMovie.title;
            movieImageDisplay.src = selectedMovie.image;

            renderSeats();
        }

        function renderSeats() {
            seatsContainer.innerHTML = '';
            for (let i = 0; i < selectedMovie.seats; i++) {
                const seat = document.createElement('div');
                seat.className = 'seat';
                if (selectedMovie.reservedSeats.includes(i)) {
                    seat.classList.add('reserved');
                }
                seat.addEventListener('click', () => {
                    if (!seat.classList.contains('reserved')) {
                        seat.classList.toggle('selected');
                    }
                });
                seatsContainer.appendChild(seat);
            }
        }
        function getReservedSeats() {
            const seats = seatsContainer.querySelectorAll('.seat');
            return Array.from(seats).reduce((arr, seat, index) => {
                if (seat.classList.contains('reserved')) {
                    arr.push(index);
                }
                return arr;
            }, []);
        }

        function updateMovieSeatsInLocalStorage(title, reservedSeats) {
            const movies = JSON.parse(localStorage.getItem('movies')) || [];
            const updatedMovies = movies.map(movie =>
                movie.title === title ? {...movie, reservedSeats} : movie
            );
            localStorage.setItem('movies', JSON.stringify(updatedMovies));
        }

        function deleteMovieFromLocalStorage(title) {
            const movies = JSON.parse(localStorage.getItem('movies')) || [];
            const updatedMovies = movies.filter(movie => movie.title !== title);
            localStorage.setItem('movies', JSON.stringify(updatedMovies));
        }
    }
);