// Do not allow console.log in production
// console.log = function () {};

if (!loadjs.isDefined("default")) {
  loadjs(
    [
      "assets/js/jquery.min.js",
      "assets/js/better-ajaxify.min.js",
      "assets/js/bootstrap.bundle.min.js",
      "assets/js/swiper-bundle.min.js",
      "assets/js/VibrantLogger.min.js",
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
      averageLoadTime = JSON.stringify({
        count: 1,
        sum: window.timeElapsed,
      });
    }

    // calculate new average
    let averageLoadTimeObj = JSON.parse(averageLoadTime);
    let newTotalSum = averageLoadTimeObj.sum + window.timeElapsed;
    let newCount = averageLoadTimeObj.count + 1;
    let newMean = newTotalSum / newCount;
    let newAverageLoadTime = JSON.stringify({
      count: newCount,
      sum: newTotalSum,
      mean: newMean,
    });
    setLocalStorage("averageLoadTime", newAverageLoadTime);
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

  initSwiper();
  logger.debug("Swiper initialized");

  removeLoader();

  if (pageName === "home") {
    loadjs(["assets/js/home.js"], "home", function () {
      homeInit();
    });
  } else if (pageName === "watch") {
    loadjs(["assets/js/watch.js"], "watch", function () {
      watchInit();
    });
  }
}

function initSwiper() {
  let swiper;
  if ($("#featured-movies")) {
    var featuredMoviesSwiper = new Swiper("#featured-movies", {
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
      loop: true,
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
      loop: true,
      navigation: {
        nextEl: "#trending-series-next",
        prevEl: "#trending-series-prev",
      },
    });
  }

  if ($("#popular-actors")) {
    swiper = new Swiper("#popular-actors", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 1,
      freeMode: true,
      loop: true,
      navigation: {
        nextEl: "#popular-actors-next",
        prevEl: "#popular-actors-prev",
      },
    });
  }

  if ($("#recommended-movies")) {
    swiper = new Swiper("#recommended-movies", {
      // no pagination, use freemode
      slidesPerView: "auto",
      spaceBetween: 15,
      freeMode: true,
      loop: true,
      navigation: {
        nextEl: "#recommended-movies-next",
        prevEl: "#recommended-movies-prev",
      },
    });
  }
}

function removeLoader() {
  // log refferer
  logger.info("Referrer: " + document.referrer);
  let pageName = getPageName();
  if (pageName != "home") {
    return;
  }
  // if startTimestamp is lower than 2 seconds, fade out, else remove

  // setLocalStorage('loadedBefore', true);

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

