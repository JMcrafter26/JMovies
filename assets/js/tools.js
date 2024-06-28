// tools.js

const logger = new Logger({
  name: "file", // The name of your app
  // theme: "light", // The theme of the logger (auto, light, dark)
  // style: "maxi" // The style of the logger (auto, maxi)
});

function getBackendUrl() {
  return window.backendUrl;
}

function setLocalStorage(key, value) {
  // check if localStorage jmovies key exists
  if (localStorage.getItem("jmovies") === null) {
    // if not, create it
    localStorage.setItem("jmovies", JSON.stringify({}));
  }
  // get the current localStorage object
  let jm26 = JSON.parse(localStorage.getItem("jmovies"));

  // set the new key value pair
  jm26[key] = value;

  // save the new object to localStorage
  localStorage.setItem("jmovies", JSON.stringify(jm26));
}

function getLocalStorage(key) {
  // check if localStorage jmovies key exists
  if (localStorage.getItem("jmovies") === null) {
    // if not, create it
    localStorage.setItem("jmovies", JSON.stringify({}));
  }
  // get the current localStorage object
  let jm26 = JSON.parse(localStorage.getItem("jmovies"));

  // return the value of the key
  return jm26[key];
}

function getPageName() {
  return $("#pageName").val();
}

function hash(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function getUrlParams() {
  let params = {};
  window.location.search.replace(
    /[?&]+([^=&]+)=([^&]*)/gi,
    function (m, key, value) {
      params[key] = value;
    }
  );
  return params;
}

function getParamByName(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function addToHistory(id) {
  let history = getLocalStorage("history");
  if (history === undefined) {
    history = [];
  }
  // if is already in history, remove it
  history = history.filter((h) => h !== id);
  history.push(id);
  setLocalStorage("history", history);
}

function clearHistory() {
  setLocalStorage("history", []);
}

function addToWatchlist(watchId) {
  let watchlist = getLocalStorage("watchlist");
  if (watchlist === undefined) {
    watchlist = [];
  }
  watchlist.push(watchId);
  setLocalStorage("watchlist", watchlist);
  logger.success("Added to watchlist");
}

function removeFromWatchlist(watchId) {
  let watchlist = getLocalStorage("watchlist");
  if (watchlist === undefined) {
    watchlist = [];
  }
  watchlist = watchlist.filter((w) => w !== watchId);
  setLocalStorage("watchlist", watchlist);
  logger.success("Removed from watchlist");
}

function isInWatchlist(watchId) {
  let watchlist = getLocalStorage("watchlist");
  if (watchlist === undefined) {
    watchlist = [];
  }
  return watchlist.includes(watchId);
}

function getWatchlist() {
  let watchlist = getLocalStorage("watchlist");
  if (watchlist === undefined) {
    watchlist = [];
  }
  return watchlist;
}

// function repairWatchlist() {
//   let watchlist = getWatchlist();
//   // loop through the watchlist data and remove elements that do not start with "m" or "s"
//   for (let i = 0; i < watchlist.length; i++) {
//     // if the element does not start with "m" or "s" or is a number or empty, remove it
//     if (isNaN(watchlist[i]) || watchlist[i] === "") {
//     if (!watchlist[i].startsWith("m") && !watchlist[i].startsWith("s")) {
//         console.log("Removing invalid watchlist item: ", watchlist[i]);
//         watchlist.splice(i, 1);
//       }
//     }
//   }
//   setLocalStorage("watchlist", watchlist);
// }

// repairWatchlist();

function insertIntoSwiper(wrapperId, type, data) {
  type = type.toLowerCase();
  let wrapper = $("#" + wrapperId);

  console.log(data);

  if (!data || data.length < 3) {
    console.error("No data received from the backend");
    return;
  }

  wrapper.empty();
  $.each(data, function(index, data) {
    const wrapperChild = $("<div>").addClass("trending-slide swiper-slide hover-poster");
    let title = data.title;
    let urlId = data.id;
    let type = data.type;
    if (type === "tv") {
      urlId = "s" + urlId;
    } else if (type === "movie") {
      urlId = "m" + urlId;
    }
    let url = `details.html?id=${urlId}&${title}`;
    let watchListBtn = '<i class="fas fa-plus"></i>';

    if (isInWatchlist(urlId)) {
      watchListBtn = '<i class="fas fa-check"></i>';
    }

    wrapperChild.html(`
      <img src="${data.poster}" alt="Movie Poster" class="movie-slide-poster" data-imgType="poster" loading="lazy">
      <div class="trending-shadow"></div>
      <div class="trending-shadow2"></div>
      <div class="trending-hover-title hover-title">${data.title}</div>
      <div class="trending-content">
        <div class="trending-slide-rating d-flex justify-content-between">
          <span>
            <i class="fas fa-star"></i>
            <span class="rating-value">${data.rating}</span>
          </span>
          <span>
            <i class="fas fa-calendar"></i>
            <span class="rating-value">${data.year}</span>
          </span>
        </div>
        <div class="trending-slide-actions">
          <a class="btn btn-primary" href="${url}">Watch</a>
          <a class="btn btn-secondary" data-watchlistbtn="${urlId}">${watchListBtn}</a>
        </div>
      </div>
    `);
    wrapper.append(wrapperChild);
  });
}


// add click event to items with data-watchlistbtn
$(document).on("click", "[data-watchlistbtn]", function (e) {
  if ($(this).data("watchlistbtn")) {
    logger.info("Watchlist button clicked");
    let watchId = $(this).data("watchlistbtn");
    if (isInWatchlist(watchId)) {
      removeFromWatchlist(watchId);
      

      // remove from every other element with data-watchlistbtn=watchId
      $(`[data-watchlistbtn="${watchId}"]`).html(
        $(`[data-watchlistbtn="${watchId}"]`).html().replace(
          '<i class="fas fa-check"></i>',
          '<i class="fas fa-plus"></i>'
        )
      );
    } else {
      addToWatchlist(watchId);
      // change the icon to a checkmark
      $(`[data-watchlistbtn="${watchId}"]`).html(
        $(`[data-watchlistbtn="${watchId}"]`).html().replace(
          '<i class="fas fa-plus"></i>',
          '<i class="fas fa-check"></i>'
        )
      );
    }
  }
});




/*
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
    */

// to every element with class slide-poster, add event listener to change the opacity of the title
$(document).on("mouseover", '.hover-poster', function (e) {
  $(this).find(".hover-title").css("opacity", 1);
});
$(document).on("mouseout", '.hover-poster', function (e) {
  $(this).find(".hover-title").css("opacity", 0);
});
$(document).on("touchstart", '.hover-poster', function (e) {

  setTimeout(() => {
    // check if the element is still being touched
    if ($(this).is(":active")) {
      $(this).find(".hover-title").css("opacity", 1);
    }
  }, 100);
});
$(document).on("touchend", '.hover-poster', function (e) {
  $(this).find(".hover-title").css("opacity", 0);
});

// if an image fails to load, replace it with a placeholder
$(document).on("error", "img", function () {
  logger.error("Image failed to load", $(this).attr("src"));

  // if src is empty or already placeholder, return
  if (!$(this).attr("src") || $(this).attr("src").includes("placeholder.")) {
    return;
  }

  // if is a poster, replace with placeholder
  if ($(this).data("imgtype") === "poster") {
    $(this).attr("src", "assets/image/poster_placeholder.png");
  }
  // if is a banner, replace with placeholder
  if ($(this).data("imgtype") === "banner") {
    // replace background image with placeholder
    $(this).css("background-image", "url('assets/image/banner_placeholder.png')");
  }
});

// if button with data-search="button" is clicked, get the value of the input with data-search="input" that has a value and redirect to search.html
$(document).on("click", "[data-search='button']", function (e) {
  search(e);
});

function search(event) {
  event.preventDefault();
  logger.info("Search button clicked");

  // get all elements with data-search="input" and check if they have a value
  let search = document.querySelectorAll("[data-search='input']");
  for (let i = 0; i < search.length; i++) {
    if (search[i].value) {
      window.location.href = `search.html?q=${search[i].value}`;
    }
  }
}