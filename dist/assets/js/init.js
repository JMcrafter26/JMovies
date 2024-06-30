/* This code snippet is checking if the `loadjs` function is defined in the global `window` object. If
it is not defined, it will output a warning message indicating that `loadjs` is not defined and then
dynamically load the `loadjs.min.js` script by writing a `<script>` tag to the document. Once
`loadjs` is loaded, it proceeds to set the `backendUrl` variable to `"backend/getData.php"`. */

if (!window.loadjs) {
  console.warn("loadjs is not defined, loading loadjs.min.js");
  document.write(
    '<script src="assets/js/loadjs.min.js" onload="loadjs(\'assets/js/init.js\')"></script>'
  );
}

window.backendUrl = "backend/getData.php";

if (!loadjs.isDefined("default")) {
  loadjs(
    [
      "assets/js/jquery.min.js",
      "assets/js/better-ajaxify.min.js",
      "assets/js/bootstrap.bundle.min.js",
      "assets/js/swiper-bundle.min.js",
      "assets/js/VibrantLogger.v3.js",
    ],
    "default",
    function () {
      loadjs("assets/js/tools.js", function () {
        pageInit();
      });
    }
  );
}


/**
 * The `pageInit` function initializes various components on a webpage, logs page information, and
 * calculates average load time.
 */
function pageInit() {
  if (startTimestamp != null) {
    window.timeElapsed = Date.now() - startTimestamp;
    logger.debug("Time elapsed: " + timeElapsed + "ms");

    let averageLoadTime = getLocalStorage("averageLoadTime");
    if (averageLoadTime === undefined) {
      averageLoadTime =  {
        count: 1,
        sum: window.timeElapsed,
      }
    }

    let averageLoadTimeObj = averageLoadTime;
    let newTotalSum = averageLoadTimeObj.sum + window.timeElapsed;
    let newCount = averageLoadTimeObj.count + 1;
    let newAverageLoadTime = newTotalSum / newCount;
    let newAverageLoadTimeArray = {
      count: newCount,
      sum: newTotalSum,
      average: newAverageLoadTime,
    };
    setLocalStorage("averageLoadTime", newAverageLoadTimeArray);
  }

  startTimestamp = null;

  $("body").append(
    '<div style="position: fixed; bottom: 0; right: 0; background-color: #000; color: #fff; padding: 5px 10px; font-size: 12px; z-index: 9999;">' +
      timeElapsed +
      "ms</div>"
  );

  let pageName = getPageName();
  logger.info("Page: " + pageName);
  if (!window.firstPage) {
    window.firstPage = pageName;
  }
  logger.info("First page: " + window.firstPage);

  if (pageName === "home") {
    if (!loadjs.isDefined("home")) {
      loadjs(["assets/js/home.js"], "home", function () {
        logger.debug("Home script loaded");
        homeInit();
      });
    } else {
      homeInit();
    }
  } else if (pageName === "watch") {
    if (!loadjs.isDefined("watch")) {
        loadjs(["assets/js/details.js"], "watch", function () {
        logger.debug("Watch script loaded");
            watchInit();
      });
    } else {
      watchInit();
    }
  } else if (pageName === "search") {
    if (!loadjs.isDefined("search")) {
      loadjs(["assets/js/search.js"], "search", function () {
        logger.debug("Search script loaded");
        searchInit();
      });
      
    } else {
      searchInit();
    }
  } else if (pageName === "user") {
    if (!loadjs.isDefined("user")) {
      loadjs(["assets/js/user.js"], "user", function () {
        logger.debug("User script loaded");
        userInit();
      });
    } else {
      userInit();
    }
  }

  initSwiper();
  logger.debug("Swiper initialized");
}

/**
 * The function `initSwiper` initializes multiple Swiper instances for different sections on a webpage
 * with specific configurations.
 */
function initSwiper() {
  let swiper;
  if ($("#featured-movies")) {
    let featuredMoviesSwiper = new Swiper("#featured-movies", {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: true,
      pagination: {
        el: "#featured-movies-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: "#featured-movies-next",
        prevEl: "#featured-movies-prev",
      },
      disableOnInteraction: true,
      autoplay: {
        delay: 5000,
      },
    });

    $("#featured-movies").mouseenter(function () {
      featuredMoviesSwiper.autoplay.stop();
    });
    $("#featured-movies").mouseleave(function () {
      featuredMoviesSwiper.autoplay.start();
    });
  }

  if ($("#trending-movies")) {
    swiper = new Swiper("#trending-movies", {
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      navigation: {
        nextEl: "#trending-movies-next",
        prevEl: "#trending-movies-prev",
      },
    });
  }

  if ($("#trending-series")) {
    swiper = new Swiper("#trending-series", {
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      navigation: {
        nextEl: "#trending-series-next",
        prevEl: "#trending-series-prev",
      },
    });
  }


  if ($("#watch-recommended")) {
    swiper = new Swiper("#watch-recommended", {
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      navigation: {
        nextEl: "#watch-recommended-next",
        prevEl: "#watch-recommended-prev",
      },
    });
  }

  if ($("#home-watchlist")) {
    swiper = new Swiper("#home-watchlist", {
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      navigation: {
        nextEl: "#home-watchlist-next",
        prevEl: "#home-watchlist-prev",
      },
    });
  }

  if ($("#watch-providers")) {
    swiper = new Swiper("#watch-providers", {
      slidesPerView: "auto",
      spaceBetween: 10,
      freeMode: true,

    });
  }


}


document.addEventListener("ajaxify:load", function (e) {
  setTimeout(function () {
    window.startTimestamp = Date.now();

    pageInit();
  }, 100);
});
