// get data from the backend
function getMovies() {
  const backend = "backend/getData.php?type=movie/popular";
  let xhr = new XMLHttpRequest();
    xhr.open("GET", backend, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            insert("movie", JSON.parse(xhr.responseText));
        }
    }
    xhr.send();
}

function getTv() {
  const backend = "backend/getData.php?type=tv/popular";
    let xhr = new XMLHttpRequest();
        xhr.open("GET", backend, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                insert("tv", JSON.parse(xhr.responseText));
            }
        }
        xhr.send();
}

function insert(type, data) {
  type = type.toLowerCase();
  let trendingMovies;
  if (type === "movie") {
    trendingMovies = document.getElementById("trending-movies-wrapper");
  } else if (type === "tv") {
    trendingMovies = document.getElementById("trending-series-wrapper");
  } else {
    logger.error("Invalid type");
    return;
  }
  console.log(data);

  if (!data) {
    logger.error("No data received from the backend");
    return;
  }
  trendingMovies.innerHTML = "";
  data.forEach((movie) => {
    const movieSlide = document.createElement("div");
    movieSlide.classList.add("trending-slide", "swiper-slide");
    movieSlide.innerHTML = `
                            <img src="${movie.poster}" alt="Movie Poster" class="movie-slide-poster" loading="lazy">
                            <div class="trending-shadow"></div>
                            <div class="trending-shadow2"></div>
                            <div class="trending-hover-title">${movie.title}</div>
                            <div class="trending-content">
                                <div class="trending-slide-rating d-flex justify-content-between">
                                    <span>
                                        <i class="fas fa-star"></i>
                                        <span class="rating-value">${movie.rating}</span>
                                    </span>
                                    <span>
                                        <i class="fas fa-calendar"></i>
                                        <span class="rating-value">${movie.year}</span>
                                    </span>
                                </div>
                                <div class="trending-slide-actions">
                                    <button class="btn btn-primary">Watch</button>
                                    <button class="btn btn-secondary"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        `;
    trendingMovies.appendChild(movieSlide);

    // add event listener
    movieSlide.addEventListener("mouseover", () => {
      movieSlide.querySelector(".trending-hover-title").style.opacity = 1;
    });
    movieSlide.addEventListener("mouseout", () => {
      movieSlide.querySelector(".trending-hover-title").style.opacity = 0;
    });

    // add mobile touch event
    movieSlide.addEventListener("touchstart", () => {
      movieSlide.querySelector(".trending-hover-title").style.opacity = 1;
    });
    movieSlide.addEventListener("touchend", () => {
      movieSlide.querySelector(".trending-hover-title").style.opacity = 0;
    });
  });
}

function homeInit() {
    getMovies();
    getTv();
}
