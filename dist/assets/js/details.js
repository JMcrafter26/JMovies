/**
 * The `watchInit` function in JavaScript handles various actions such as setting active buttons,
 * playing and closing trailers, switching between movie details and recommended movies, checking for
 * valid watchId, and fetching details and recommendations.
 * @returns The `watchInit` function is being executed, but it does not explicitly return any value. It
 * mainly handles various actions and event listeners related to watching movies or TV shows on a
 * website.
 */
function watchInit() {
  if (window.location.hash == "#details") {
    $("#detailsBtn").addClass("active");
    $("#recommendedBtn").removeClass("active");
    $("#details-movies-container").removeClass("d-none");
    $("#recommended-movies-container").addClass("d-none");
  }

  if (window.location.hash == "") {
    window.scrollTo(0, 0);
    let url = new URL(window.location.href);
    url.hash = "#watch";
    window.history.replaceState({}, document.title, url);
  }

  $("#playTrailer").click(function () {
    $("#watch-trailer-container").addClass("d-flex");
    $("#watch-trailer-container").removeClass("d-none");
    let src = $("#watch-trailer").attr("data-src");
    $("#watch-trailer").attr("src", src);
  });

  $("#closeTrailer").click(function () {
    $("#watch-trailer-container").removeClass("d-flex");
    $("#watch-trailer-container").addClass("d-none");
    $("#watch-trailer").attr("src", "");
  });

  $("#watch-trailer-container").click(function (e) {
    if ($(e.target).hasClass("watch-trailer")) {
      $("#watch-trailer-container").removeClass("d-flex");
      $("#watch-trailer-container").addClass("d-none");
      $("#watch-trailer").attr("src", "");
    }
  });

  $("#recommendedBtn").click(function () {
    $("#recommendedBtn").addClass("active");
    $("#detailsBtn").removeClass("active");
    $("#recommended-movies-container").removeClass("d-none");
    $("#details-movies-container").addClass("d-none");

    let url = new URL(window.location.href);
    url.hash = "#watch";
    window.history.replaceState({}, document.title, url);
  });

  $("#detailsBtn").click(function () {
    $("#detailsBtn").addClass("active");
    $("#recommendedBtn").removeClass("active");
    $("#details-movies-container").removeClass("d-none");
    $("#recommended-movies-container").addClass("d-none");

    let url = new URL(window.location.href);
    url.hash = "#details";
    window.history.replaceState({}, document.title, url);
  });

  let watchId = getParamByName("id");
  if (!watchId) {
    window.location.replace("./index.html");
  }
  let type;
  if (watchId.startsWith("s")) {
    type = "tv";
  } else if (watchId.startsWith("m")) {
    type = "movie";
  } else {
    logger.error("Invalid watchId");
    window.location.replace("./index.html");
    invalidId("No type in id");

    return;
  }
  window.type = type;
  addToHistory(watchId);

  watchId = watchId.substring(1);

  getDetails();
  getRecommended();
}

/**
 * The function `getDetails` retrieves details for a specific watch item using an XMLHttpRequest to a
 * backend URL based on the watch ID and type.
 * @returns The `getDetails` function is making an XMLHttpRequest to a backend URL to fetch details for
 * a specific watch item. The function extracts the watch ID from a query parameter, gets the type from
 * a global variable `window.type`, constructs the backend URL using the type and watch ID, and sends a
 * GET request to the backend.
 */
function getDetails() {
  let watchId = getParamByName("id");
  watchId = watchId.substring(1);

  let type = window.type;

  logger.info("Getting details for: " + watchId + " (" + type + ")");

  const backendUrl = window.backendUrl + `?type=${type}/${watchId}`;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", backendUrl, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let data = JSON.parse(xhr.responseText);
      console.log(data);
      if (data.error) {
        invalidId(data.error);
        return;
      }
      window.details = data;
      setDetails(data, type);

      document.dispatchEvent(new Event("fetchWatchUrl"));
    }
  };
  xhr.send();
}

/**
 * The function `setDetails` populates a webpage with movie details received from the backend API,
 * including title, poster, description, genres, runtime, trailer, cast, crew, production companies,
 * and more.
 * @param data - The `data` parameter in the `setDetails` function seems to contain information about a
 * movie or TV show. It includes details such as id, title, poster image, description, genres, release
 * date, rating, runtime, trailer, cast, crew, production companies, and more. The function
 * @param type - The `type` parameter in the `setDetails` function is used to specify the type of data
 * being passed. It helps determine how to handle and display the details based on whether it is a
 * movie or a TV show.
 * @returns The `setDetails` function does not explicitly return any value. It mainly updates the
 * details of a movie or TV show based on the provided data and type. The function modifies the HTML
 * elements on a webpage to display information about the movie or TV show, such as title, poster,
 * description, genres, runtime, trailer, cast, crew, production companies, and more.
 */
function setDetails(data, type) {
  if (!data || data.length < 3) {
    logger.error("No data received from the backend");
    return;
  }

  let detailsTemplate = {
    id: "-",
    title: "-",
    poster: "assets/img/placeholder.png",
    banner: "assets/img/placeholder.png",
    description: "Failed to load description",
    genres: [],
    release_date: "-",
    rating: "-",
    year: "-",
    homepage: "",
    original_country: "-",
    original_language: "-",
    original_title: "-",
    production_companies: [],
    runtime: "-",
    runtime_text: "-",
    status: "-",
    tagline: "-",
    external_ids: {
      imdb_id: "",
      wikidata_id: "",
      facebook_id: "",
      instagram_id: "",
      twitter_id: "",
    },
    trailer: "",
    trailerEmbed: "",
    age_rating: "N/A",
    type: "",
    cast: [],
    crew: [],
  };

  let details = {};
  for (let key in detailsTemplate) {
    if (key in data && data[key] != null && data[key] != "") {
      details[key] = data[key];
    } else {
      details[key] = detailsTemplate[key];
    }
  }

  document.title = details.title + " - JMovies";

  $("#watch-title").text(details.title);
  $("#watch-poster").attr("src", details.poster);
  $("#watch-banner").attr("src", details.banner);
  $("#watch-release-year").text(details.year);
  let shortDescription = details.description;
  if (shortDescription.length > 200) {
    shortDescription =
      shortDescription.substring(0, 200) +
      "... <a class='text-body' href='#description' onclick='document.getElementById(\"detailsBtn\").click(); document.getElementById(\"details-movie\").scrollIntoView();' >Read more</a>";
  }
  $("#watch-short-description").html(shortDescription);
  $("#watch-age-rating").text(details.age_rating + "+");
  $("#watch-age-rating").removeClass("placeholder");
  if (details.genres.length > 0) {
    $("#watch-genre").text(details.genres[0].name);
  } else {
    $("#watch-genre").text("-");
  }

  let hours = Math.floor(details.runtime / 60);
  let minutes = details.runtime % 60;
  details.runtime_text = hours + "h " + minutes + "m";
  $("#watch-duration").text(details.runtime_text);
  $("#watch-trailer").attr("data-src", details.trailerEmbed);
  if (details.trailerEmbed != "" && details.trailerEmbed != "-") {
    $("#playTrailer").removeClass("d-none");
  }

  $("#watch-watchlistBtn").removeClass("placeholder");
  if (details.type === "tv") {
    $("#watch-watchlistBtn").attr("data-watchlistbtn", "s" + details.id);
  } else {
    $("#watch-watchlistBtn").attr("data-watchlistbtn", "m" + details.id);
  }
  if (isInWatchlist($("#watch-watchlistBtn").attr("data-watchlistbtn"))) {
    $("#watch-watchlistBtn").html(`<i class="fas fa-check"></i> Watchlist`);
  } else {
    $("#watch-watchlistBtn").html(`<i class="fas fa-plus"></i> Watchlist`);
  }
  $("#watch-watchBtn").removeClass("placeholder");
  $("#watch-watchBtn").html(`<i class="fas fa-play"></i> Watch`);

  $("#watch-original-title").text(details.original_title);
  $("#watch-tagline").text(details.tagline);
  $("#watch-description").text(details.description);
  $("#watch-release-date").text(
    details.release_date +
      " (" +
      details.status +
      " | " +
      details.original_country +
      ")"
  );
  $("#watch-rating").html(`<i class="fas fa-star"></i> ${details.rating}`);
  $("#watch-runtime").text(
    details.runtime + " minutes (" + details.runtime_text + ")"
  );
  $("#watch-genres").text(details.genres.map((genre) => genre.name).join(", "));
  if (details.crew.length > 3 && details.crew != "NULL") {
    $("#watch-crew").html(
      details.crew.map((crew) => crew.name + " (" + crew.job + ")").join(", ")
    );
  } else {
    $("#watch-crew").text("-");
  }
  if (details.cast.length > 3 && details.cast != "NULL") {
    $("#watch-cast").html(
      details.cast
        .map((cast) => cast.name + " (" + cast.character + ")")
        .join(", ")
    );
  } else {
    $("#watch-cast").text("-");
  }
  $("#watch-production").text(
    details.production_companies.map((company) => company.name).join(", ")
  );
  $("#watch-country").text(details.original_country);
  let moreInfo = "";
  if (details.homepage) {
    moreInfo += `<a class="text-decoration-none" href="${details.homepage}" target="_blank">Homepage</a> | `;
  }
  if (details.external_ids.imdb_id) {
    moreInfo += ` <a class="text-decoration-none" href="https://www.imdb.com/title/${details.external_ids.imdb_id}" target="_blank">IMDb</a> | `;
  }
  if (details.external_ids.wikidata_id) {
    moreInfo += `<a class="text-decoration-none" href="https://www.wikidata.org/wiki/${details.external_ids.wikidata_id}" target="_blank">Wikidata</a> | `;
  }
  if (details.external_ids.facebook_id) {
    moreInfo += `<a class="text-decoration-none" href="https://www.facebook.com/${details.external_ids.facebook_id}" target="_blank"><i class="fab fa-facebook"></i> Facebook</a> | `;
  }
  if (details.external_ids.instagram_id) {
    moreInfo += `<a class="text-decoration-none" href="https://www.instagram.com/${details.external_ids.instagram_id}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a> | `;
  }
  if (details.external_ids.twitter_id) {
    moreInfo += `<a class="text-decoration-none" href="https://www.twitter.com/${details.external_ids.twitter_id}" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>`;
  }
  if (moreInfo.endsWith(" | ")) {
    moreInfo = moreInfo.substring(0, moreInfo.length - 3);
  }
  $("#watch-more-info").html(moreInfo);

  let watchProviders = data.watch_providers;
  let watchProvidersWrapper = document.getElementById(
    "watch-providers-wrapper"
  );
  if (watchProviders != null) {
    watchProvidersWrapper.innerHTML = "";
    for (let provider in watchProviders) {
      let providerData = watchProviders[provider];
      let providerDiv = document.createElement("div");
      providerDiv.classList.add("watch-provider", "swiper-slide");
      let providerLink = document.createElement("a");
      providerLink.href = providerData.link;
      providerLink.target = "_blank";
      providerLink.title = providerData.provider_name;
      let providerImg = document.createElement("img");
      providerImg.src = providerData.logo;
      providerImg.alt = providerData.provider_name;
      providerLink.appendChild(providerImg);
      providerDiv.appendChild(providerLink);
      watchProvidersWrapper.appendChild(providerDiv);
    }
    const swiper = document.getElementById("watch-providers").swiper;
    swiper.updateSlides();
  } else {
    watchProvidersWrapper.innerHTML = `<p class="text-center">No streaming providers available</p>`;
    const swiper = document.getElementById("watch-providers").swiper;
    swiper.destroy();
  }
}

/**
 * The function `getRecommended` retrieves recommended content based on a specified watch ID and type,
 * making an XMLHttpRequest to a backend URL and updating the UI accordingly.
 * @returns The `getRecommended` function is making an XMLHttpRequest to a backend URL to fetch
 * recommended content based on the type (tv or movie) and watchId provided as parameters. The function
 * then processes the response data and inserts it into a Swiper element on the webpage for display. If
 * there is an error in the response data, it calls the `invalidId` function with the error message.
 */
function getRecommended() {
  let watchId = getParamByName("id");
  let type;
  if (watchId.startsWith("s")) {
    type = "tv";
  } else if (watchId.startsWith("m")) {
    type = "movie";
  } else {
    logger.error("Invalid watchId");
    invalidId("No type in id");
    return;
  }

  watchId = watchId.substring(1);

  logger.info("Getting recommended for: " + watchId + " (" + type + ")");

  const backendUrl =
    window.backendUrl + `?type=${type}/${watchId}/recommendations`;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", backendUrl, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let data = JSON.parse(xhr.responseText);
      console.log(data);
      if (data.error) {
        invalidId(data.error);
        return;
      }
      insertIntoSwiper("watch-recommended-wrapper", window.type, data);
      const swiper = document.getElementById("watch-recommended").swiper;
      swiper.updateSlides();
    }
  };
  xhr.send();
}

function invalidId(message = "") {
  logger.warn("An error occured: " + message);
}
