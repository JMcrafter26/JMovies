// get data from the backend

function home_getFeatured() {
  const backend = window.backendUrl + "?type=movie/now_playing";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", backend, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      home_insertFeatured(JSON.parse(xhr.responseText));
      // swiper updateSlides

      // get the swiper instance
      const swiper = document.getElementById("featured-movies").swiper;
      swiper.updateSlides();
      window.homeLoaded += 3;
      removeLoader();
    }
  };
  xhr.send();
}

function home_getMovies() {
  const backend = window.backendUrl + "?type=movie/popular";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", backend, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      home_insert("movie", JSON.parse(xhr.responseText));
      const swiper = document.getElementById("trending-movies").swiper;
      swiper.updateSlides();
      window.homeLoaded++;
      removeLoader();
    }
  };
  xhr.send();
}

function home_getTv() {
  const backend = window.backendUrl + "?type=tv/popular";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", backend, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      home_insert("tv", JSON.parse(xhr.responseText));
      const swiper = document.getElementById("trending-series").swiper;
      swiper.updateSlides();
      // window.homeLoaded++;
      removeLoader();
    }
  };
  xhr.send();
}

function home_insert(type, data) {
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

  if (!data || data.length < 3) {
    logger.error("No data received from the backend");
    return;
  }

  trendingMovies.innerHTML = "";
  data.forEach((movie) => {
    const movieSlide = document.createElement("div");
    movieSlide.classList.add("trending-slide", "swiper-slide");
    let title = movie.title.replace(/ /g, "-");
    let urlId = movie.id;
    if (type === "tv") {
      urlId = "s" + urlId;
    } else {
      urlId = "m" + urlId;
    }
    let url = `watch.html?id=${urlId}&${title}`;
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
                                <a class="btn btn-primary" href="${url}">Watch</a>
                                <a class="btn btn-secondary" data-watchlistbtn="${urlId}"><i class="fas fa-plus"></i></a>
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

function home_insertFeatured(data) {
  const featured = document.getElementById("featured-movies-wrapper");
  if (!data || data.length < 3) {
    logger.error("No data received from the backend");
    return;
  }
  console.log(data);
  featured.innerHTML = "";
  data.forEach((movie) => {
    const movieSlide = document.createElement("div");
    movieSlide.classList.add("swiper-slide");
    let title = movie.title.replace(/ /g, "-");
    let urlId = movie.id;
    let url = `watch.html?id=m${urlId}&${title}`;
    let description = movie.description;
    if (description.length > 100) {
      description = description.substring(0, 100) + "...";
    }
    let mobileDescription = movie.description;

    if (mobileDescription.length > 50) {
      mobileDescription = mobileDescription.substring(0, 50) + "...";
    }
    if (movie.title.length > 15) {
      if (description.length > 40) {
        mobileDescription = mobileDescription.substring(0, 40) + "...";
      }
    }
    if (movie.title.length > 20) {
      if (description.length > 30) {
        mobileDescription = mobileDescription.substring(0, 30) + "...";
      }
    }

    // if title is longer than 20 characters, use mobile description
    if (movie.title.length > 20) {
      // description = mobileDescription;
    }
    movieSlide.innerHTML = `
    <div class="movie-slide">
        <div class="movie-slide-bg"
            style="background-image: url('${movie.banner}');">
        </div>
        <div class="movie-slide-gradient">
            <div class="movie-slide-content">
                <img src="${movie.poster}"
                    alt="Movie Poster" class="movie-slide-poster">
                <div class="movie-slide-details">
                    <h3 class="movie-slide-title">${movie.title}</h3>
                    <p class="movie-slide-description d-none d-md-block d-lg-block d-xl-block d-xxl-block">${description}</p>
                    <p class="movie-slide-description d-block d-md-none d-lg-none d-xl-none d-xxl-none">${mobileDescription}</p>
                    <div class="movie-slide-rating">
                        <i class="fas fa-star"></i>
                        <span class="rating-value">${movie.rating}</span>
                    </div>
                    <div class="movie-slide-actions">
                        <a class="btn btn-primary" href="${url}">Watch</a>
                        <button class="btn btn-secondary" data-watchlistbtn="${urlId}"><i class="fas fa-plus"></i> <span class="d-none d-md-inline"> Watchlist</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    featured.appendChild(movieSlide);
  });
}

function homeInit() {
  window.homeLoaded = 0;
  home_getFeatured();
  home_getMovies();
  home_getTv();

  // after 10 seconds, remove the loader
  setTimeout(() => {
    // check if the elements are empty
    if (document.getElementById("trending-movies-wrapper").innerHTML === "" || document.getElementById("trending-series-wrapper").innerHTML === "" || document.getElementById("featured-movies-wrapper").innerHTML === "") {
      logger.error("Failed to load home page, all elements are empty");
      return;
    } 
    window.homeLoaded = 3;
    removeLoader();
  }, 10000);
}
