// Do not allow console.log in production
// console.log = function () {};

// if loadjs is not defined, load loadjs.min.js itself
if (!window.loadjs) {
  console.warn("loadjs is not defined, loading loadjs.min.js");
  document.write(
    '<script src="assets/js/loadjs.min.js" onload="loadjs(\'assets/js/init.js\')"></script>'
  );
}

// <script src="//cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js"></script>
window.backendUrl = "backend/getData.php";

if (!loadjs.isDefined("default")) {
  loadjs(
    [
      "assets/js/jquery.min.js",
      "assets/js/better-ajaxify.min.js",
      "assets/js/bootstrap.bundle.min.js",
      "assets/js/swiper-bundle.min.js",
      // "assets/js/VibrantLogger.min.js",
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

// cdn alternative
// if (!loadjs.isDefined('default')) {
//     loadjs(['https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js', 'https://cdn.jsdelivr.net/npm/better-ajaxify/dist/better-ajaxify.min.js', 'https://cdn.jsdelivr.net/npm/bootstrap/dist/js/bootstrap.bundle.min.js', 'https://unpkg.com/swiper/swiper-bundle.min.js', 'assets/js/tools.js'], 'default', function () {
//         pageInit();
//     });
// }

function pageInit() {
  if (startTimestamp != null) {
    window.timeElapsed = Date.now() - startTimestamp;
    logger.debug("Time elapsed: " + timeElapsed + "ms");

    // add it to averageLoadTime
    let averageLoadTime = getLocalStorage("averageLoadTime");
    if (averageLoadTime === undefined) {
      averageLoadTime =  {
        count: 1,
        sum: window.timeElapsed,
      }
    }

    // calculate new average
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

  // reset startTimestamp
  startTimestamp = null;

  // append a small badge to the bottom right of the screen displaying the time elapsed
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
      // loadjs(["assets/css/plyr.css", "assets/js/plyr.js", "assets/js/details.js"], "watch", function () {
        loadjs(["assets/js/details.js"], "watch", function () {
        logger.debug("Watch script loaded");
        // check if assets/js/fetchUrl.js exists, if it does, load it
        loadjs("assets/js/fetchUrl.js", function () {
          logger.debug("FetchUrl script loaded");
          watchInit();
        });
      });
    } else {
      watchInit();
    }
  } else if (pageName === "about") {
  }

  initSwiper();
  logger.debug("Swiper initialized");
}

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

    // // on hover stop autoplay
    $("#featured-movies").mouseenter(function () {
      //   console.log("stop autoplay");
      featuredMoviesSwiper.autoplay.stop();
    });
    $("#featured-movies").mouseleave(function () {
      //   console.log("start autoplay");
      featuredMoviesSwiper.autoplay.start();
    });
  }

  if ($("#trending-movies")) {
    swiper = new Swiper("#trending-movies", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      // loop: true,
      navigation: {
        nextEl: "#trending-movies-next",
        prevEl: "#trending-movies-prev",
      },
    });
  }

  if ($("#trending-series")) {
    swiper = new Swiper("#trending-series", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      // loop: true,
      navigation: {
        nextEl: "#trending-series-next",
        prevEl: "#trending-series-prev",
      },
    });
  }

  // if ($("#popular-actors")) {
  //   swiper = new Swiper("#popular-actors", {
  //     // no pagination, use freemode
  //     slidesPerView: "auto",
  //     spaceBetween: 1,
  //     freeMode: true,
  //     loop: true,
  //     navigation: {
  //       nextEl: "#popular-actors-next",
  //       prevEl: "#popular-actors-prev",
  //     },
  //   });
  // }

  if ($("#watch-recommended")) {
    swiper = new Swiper("#watch-recommended", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      // loop: true,
      navigation: {
        nextEl: "#watch-recommended-next",
        prevEl: "#watch-recommended-prev",
      },
    });
  }

  if ($("#home-watchlist")) {
    swiper = new Swiper("#home-watchlist", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      // loop: true,
      navigation: {
        nextEl: "#home-watchlist-next",
        prevEl: "#home-watchlist-prev",
      },
    });
  }

}



document.addEventListener("ajaxify:load", function (e) {
  // trigger event that pageName input value has changed

  // wait 100ms before triggering pageInit
  setTimeout(function () {
    // buildDebugBar();
    window.startTimestamp = Date.now();

    pageInit();
  }, 100);
  // logger.log('page: ' + document.getElementById('pageName').value);
});
