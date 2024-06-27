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
      // home_insert("movie", JSON.parse(xhr.responseText));
      // insertIntoSwiper(wrapperId, type, data) 
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
      // home_insert("tv", JSON.parse(xhr.responseText));
      insertIntoSwiper("trending-series-wrapper", "tv", JSON.parse(xhr.responseText));
      const swiper = document.getElementById("trending-series").swiper;
      swiper.updateSlides();
      // window.homeLoaded++;
      removeLoader();
    }
  };
  xhr.send();
}

function home_getWatchlist() {
  let watchlist = getWatchlist();
  console.log(watchlist);
  logger.info("Watchlist: " + watchlist);
  
  // if the watchlist is empty, remove the watchlist section. watchlist is an []
  if (watchlist.length < 1) {
    // remove the watchlist section
    $("#home-watchlist-container").remove();
    return;
  }
  logger.info("Watchlist length: " + watchlist.length);
  // We do not save any data in the backend. The backend is only used to get the watchlist data from the Movie API.
  const backend = window.backendUrl + "?type=watchlist";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", backend, true);
  // xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      // home_insert("tv", JSON.parse(xhr.responseText));
      insertIntoSwiper("home-watchlist-wrapper", "watchlist", JSON.parse(xhr.responseText));
      const swiper = document.getElementById("home-watchlist").swiper;
      swiper.updateSlides();
      window.homeLoaded++;
      removeLoader();
    }
  };

  xhr.send("watchlist=" + JSON.stringify(watchlist));
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

    // if title is longer than 20 characters, use mobile description
    if (movie.title.length > 20) {
      // description = mobileDescription;
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

function removeLoader() {
  // log refferer
  let pageName = getPageName();
  if (pageName != "home") {
    return;
  }

  if (window.homeLoaded < 3) {
    return;
  }

  // remove class stopScrolling from body
  $("body").removeClass("stopScrolling");

  if (window.timeElapsed > 2000) {
    // Remove the page loader
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

function homeInit() {
  window.homeLoaded = 0;
  home_getFeatured();
  home_getMovies();
  home_getTv();
  home_getWatchlist();

  // after 10 seconds, remove the loader
  setTimeout(() => {
    // check if the elements are empty
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
