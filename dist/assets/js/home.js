/**
 * The above functions in JavaScript make XMLHttpRequest calls to fetch data for featured movies,
 * trending movies, trending TV series, and user watchlist from a backend API.
 */
function home_getFeatured() {
  const backend = window.backendUrl + "?type=movie/now_playing";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", backend, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      home_insertFeatured(JSON.parse(xhr.responseText));

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
      insertIntoSwiper("trending-movies-wrapper", "movie", JSON.parse(xhr.responseText));
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
      insertIntoSwiper("trending-series-wrapper", "tv", JSON.parse(xhr.responseText));
      const swiper = document.getElementById("trending-series").swiper;
      swiper.updateSlides();
      removeLoader();
    }
  };
  xhr.send();
}

function home_getWatchlist() {
  let watchlist = getWatchlist();
  console.log(watchlist);
  logger.info("Watchlist: " + watchlist);
  
  if (watchlist.length < 1) {
    $("#home-watchlist-container").remove();
    return;
  }
  logger.info("Watchlist length: " + watchlist.length);
  const backend = window.backendUrl + "?type=watchlist";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", backend, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      insertIntoSwiper("home-watchlist-wrapper", "watchlist", JSON.parse(xhr.responseText));
      const swiper = document.getElementById("home-watchlist").swiper;
      swiper.updateSlides();
      window.homeLoaded++;
      removeLoader();
    }
  };

  xhr.send("watchlist=" + JSON.stringify(watchlist));
}

/**
 * The function `home_insertFeatured` populates the featured movies section on a webpage with data
 * received from the backend, including movie details and actions like adding to watchlist.
 * @param data - The `data` parameter in the `home_insertFeatured` function is an array of movie
 * objects. Each movie object contains properties such as `id`, `title`, `description`, `banner`,
 * `poster`, and `rating`. The function loops through this array to create HTML elements for each movie
 * and
 * @returns The `home_insertFeatured` function is returning nothing (`undefined`) as it does not have
 * an explicit return value. The function is responsible for inserting featured movies into the DOM
 * based on the data provided.
 */
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
    let urlId = "m" + movie.id;
    let url = `details.html?id=${urlId}&${title}`;
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

    if (movie.title.length > 20) {
    }

    let watchListBtn = '<i class="fas fa-plus"></i>';

    if (isInWatchlist(urlId)) {
      logger.info("Movie is in watchlist");
      watchListBtn = '<i class="fas fa-check"></i>';
    }
    movieSlide.innerHTML = `
    <div class="movie-slide">
        <div class="movie-slide-bg"
            style="background-image: url('${movie.banner}');" data-imgType="banner">
        </div>
        <div class="movie-slide-gradient">
            <div class="movie-slide-content">
                <img src="${movie.poster}"
                    alt="Movie Poster" class="movie-slide-poster" data-imgType="poster">
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
                        <button class="btn btn-secondary" data-watchlistbtn="${urlId}">${watchListBtn} <span class="d-none d-md-inline"> Watchlist</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    featured.appendChild(movieSlide);
  });
}

/**
 * The function `removeLoader` checks if the page is "home", if `homeLoaded` is greater than 3, and if
 * `timeElapsed` is greater than 2000 to remove a loader animation from the page.
 * @returns If the `pageName` is not equal to "home" or if `window.homeLoaded` is less than 3, the
 * function will return without removing the loader.
 */
function removeLoader() {
  let pageName = getPageName();
  if (pageName != "home") {
    return;
  }

  if (window.homeLoaded < 3) {
    return;
  }

  $("body").removeClass("stopScrolling");

  if (window.timeElapsed > 2000) {
    $(".page-loader img").removeClass("page-loader-animation");
    $(".page-loader").addClass("page-loader-fade");
    setTimeout(function () {
      $(".page-loader").hide();
    }, 600);
  } else {
    $(".page-loader").addClass("page-loader-fade").hide();
    $(".page-loader img").removeClass("page-loader-animation");
  }
}

/**
 * The `homeInit` function initializes the home page by fetching featured content, movies, TV shows,
 * and watchlist items, and sets a timeout to check if all elements are loaded successfully.
 */
function homeInit() {
  window.homeLoaded = 0;
  home_getFeatured();
  home_getMovies();
  home_getTv();
  home_getWatchlist();

  setTimeout(() => {
    if (
      $("#trending-movies-wrapper").html() === "" ||
      $("#trending-series-wrapper").html() === "" ||
      $("#featured-movies-wrapper").html() === ""
    ) {
      logger.error("Failed to load home page, all elements are empty");
      return;
    }
    window.homeLoaded = 3;
    removeLoader();
  }, 10000);
}
