function watchInit() {
  // if hash is details, show the details
  if (window.location.hash == "#details") {
    $("#detailsBtn").addClass("active");
    $("#recommendedBtn").removeClass("active");
    $("#details-movies-container").removeClass("d-none");
    $("#recommended-movies-container").addClass("d-none");
  }

  if (window.location.hash == "") {
    // scroll to top
    window.scrollTo(0, 0);
    // set the hash to watch
    let url = new URL(window.location.href);
    url.hash = "#watch";
    // push the new url with hash
    window.history.replaceState({}, document.title, url);
  }

  //   EVENT LISTENERS
  // if the play button is clicked, show the trailer
  $("#playTrailer").click(function () {
    $(".trailer").addClass("active");
    // set the src of the trailer to data-src
    let src = $("#watch-trailer").attr("data-src");
    $("#watch-trailer").attr("src", src);
  });

  // if the close button is clicked, hide the trailer
  $("#closeTrailer").click(function () {
    $(".trailer").removeClass("active");
    // remove the src of the trailer
    $("#watch-trailer").attr("src", "");
  });

  // if clicked outside the trailer, hide the trailer
  $(".trailer").click(function (e) {
    if ($(e.target).hasClass("trailer")) {
      $(".trailer").removeClass("active");
      $("#watch-trailer").attr("src", "");
    }
  });

  // if the recommended button is clicked, show the recommended movies
  $("#recommendedBtn").click(function () {
    $("#recommendedBtn").addClass("active");
    $("#detailsBtn").removeClass("active");
    $("#recommended-movies-container").removeClass("d-none");
    $("#details-movies-container").addClass("d-none");

    // remove hash from the url
    let url = new URL(window.location.href);
    url.hash = "#watch";
    // replace the new url without hash
    window.history.replaceState({}, document.title, url);
  });

  // if the details button is clicked, show the details
  $("#detailsBtn").click(function () {
    $("#detailsBtn").addClass("active");
    $("#recommendedBtn").removeClass("active");
    $("#details-movies-container").removeClass("d-none");
    $("#recommended-movies-container").addClass("d-none");

    // add hash #details to the url, but do not save it in the history
    let url = new URL(window.location.href);
    url.hash = "#details";
    // push the new url with hash
    window.history.replaceState({}, document.title, url);
  });

  let watchId = getParamByName("id");
  // if id starts with s, it is a series, else it is a movie
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
  window.type = type;
  addToHistory(watchId);

  watchId = watchId.substring(1);

  getDetails();
  getRecommended();
}

function getDetails() {
  let watchId = getParamByName("id");
  watchId = watchId.substring(1);

  let type = window.type;


  logger.info("Getting details for: " + watchId + " (" + type + ")");

  // get the details from the backend
  const backendUrl = window.backendUrl + `?type=${type}/${watchId}`;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", backendUrl, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let data = JSON.parse(xhr.responseText);
      logger.info("Details received", data);
      console.log(data);
      if (data.error) {
        invalidId(data.error);
        return;
      }
      window.details = data;
      setDetails(data, type);

      // dispatch event called fetchWatchUrl
      document.dispatchEvent(new Event("fetchWatchUrl"));

    }
  };
  xhr.send();
}

function setDetails(data, type) {
  // check if data is empty or length is less than 3
  if (!data || data.length < 3) {
    logger.error("No data received from the backend");
    return;
  }

  // set the details
  // let details = data;
  /* example response
    {
        {
      "id": 1022789,
      "title": "Alles steht Kopf 2",
      "poster": "https:\/\/image.tmdb.org\/t\/p\/w500\/d1x6XyewluS8gxPXqb0PZnpQPUQ.jpg",
      "banner": "https:\/\/image.tmdb.org\/t\/p\/original\/stKGOm8UyhuLPR9sZLjs5AkmncA.jpg",
      "description": "Im Kopf des nun frischgebackenen Teenagers Riley wird pl\u00f6tzlich das Hauptquartier abgerissen, um Platz f\u00fcr etwas v\u00f6llig Unerwartetes zu schaffen: neue Emotionen! Freude, Trauer, Wut, Angst und Ekel, die seit langem erfolgreich Rileys Kopf managen, sind sich nicht sicher, was sie f\u00fchlen sollen, als Zweifel auftaucht. Und es sieht so aus, als ob sie nicht die einzige Neue ist!",
      "genres": [
          {
              "id": 16,
              "name": "Animation"
          },
          {
              "id": 10751,
              "name": "Familie"
          },
          {
              "id": 12,
              "name": "Abenteuer"
          },
          {
              "id": 35,
              "name": "Kom\u00f6die"
          }
      ],
      "release_date": "2024-06-11",
      "rating": "7.7",
      "year": "2024",
      "homepage": "",
      "original_country": "US",
      "original_language": "en",
      "original_title": "Inside Out 2",
      "production_companies": [
          {
              "id": 3,
              "logo_path": "\/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png",
              "name": "Pixar",
              "origin_country": "US"
          },
          {
              "id": 2,
              "logo_path": "\/wdrCwmRnLFJhEoH8GSfymY85KHT.png",
              "name": "Walt Disney Pictures",
              "origin_country": "US"
          }
      ],
      "runtime": 97,
      "runtime_text": "1h 37m",
      "status": "Released",
      "tagline": "Voll emotional!",
      "external_ids": {
          "imdb_id": "tt22022452",
          "wikidata_id": "Q113877606",
          "facebook_id": "",
          "instagram_id": "",
          "twitter_id": ""
      },
      "trailer": "https:\/\/www.youtube.com\/watch?v=iEHjmWGFPa8",
      "age_rating": "0",
      "cast": [
          {
              "name": "Amy Poehler",
              "character": "Joy (voice)",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/rwmvRonpluV6dCPiQissYrchvSD.jpg"
          },
          {
              "name": "Maya Hawke",
              "character": "Anxiety (voice)",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/evjbbHM1bzA6Ma5Ptjwa4WkYkkj.jpg"
          },
          {
              "name": "Kensington Tallman",
              "character": "Riley (voice)",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/tBqawwg2VJq1V4mZjAOFQ7fnXNW.jpg"
          },
          {
              "name": "Liza Lapira",
              "character": "Disgust (voice)",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/o3jvQAGWtxi5rEycslhC6CY8BWX.jpg"
          },
          {
              "name": "Phyllis Smith",
              "character": "Sadness (voice)",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/h9w9pQbiderRWAC2mi7spjzuIGz.jpg"
          }
      ],
      "crew": [
          {
              "name": "Kelsey Mann",
              "job": "Director",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/fK0QGrUmIPmQdyVXY3aFFafFMC0.jpg"
          },
          {
              "name": "Mark Nielsen",
              "job": "Producer",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/bqojcGtjzHDiUWgcpjbgY1KEyOx.jpg"
          },
          {
              "name": "Pete Docter",
              "job": "Executive Producer",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/xz46mHzo8apkVMxmrkMQvqakOL0.jpg"
          },
          {
              "name": "Jonas Rivera",
              "job": "Executive Producer",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/uzoCan3ZeK2jXt3NaZ6uilvcQTU.jpg"
          },
          {
              "name": "Dan Scanlon",
              "job": "Executive Producer",
              "profile": "https:\/\/image.tmdb.org\/t\/p\/w185\/sNHqtJKMd59fvEiwBRPD3zKKYQ4.jpg"
          }
      ]
    }
    */

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

  // use the template and fill in the details, if the value is not available, use the default value
  let details = {};
  for (let key in detailsTemplate) {
    if (key in data && data[key] != null && data[key] != "") {
      details[key] = data[key];
    } else {
      details[key] = detailsTemplate[key];
    }
  }

  // set page title
  document.title = details.title + " - JMovies";

  $("#watch-title").text(details.title);
  $("#watch-poster").attr("src", details.poster);
  $("#watch-banner").attr("src", details.banner);
  $("#watch-release-year").text(details.year);
  let shortDescription = details.description;
  if (shortDescription.length > 200) {
    shortDescription = shortDescription.substring(0, 200) + "... <a class='text-body' href='#description' onclick='document.getElementById(\"detailsBtn\").click(); document.getElementById(\"details-movie\").scrollIntoView();' >Read more</a>";
  }
  $("#watch-short-description").html(shortDescription);
  $("#watch-age-rating").text(details.age_rating + "+");
  // remove class placeholder from the age rating
  $("#watch-age-rating").removeClass("placeholder");
  // get the first genre
  if (details.genres.length > 0) {
    $("#watch-genre").text(details.genres[0].name);
  } else {
    $("#watch-genre").text("-");
  }
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
  if(isInWatchlist($("#watch-watchlistBtn").attr("data-watchlistbtn"))) {
    $("#watch-watchlistBtn").html(`<i class="fas fa-check"></i> Watchlist`);
  } else {
    $("#watch-watchlistBtn").html(`<i class="fas fa-plus"></i> Watchlist`);
  }
  // $("#watch-watchlistBtn").html(`<i class="fas fa-plus"></i> Watchlist`);
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
  // crew, the name of the person and the job
  if (details.crew.length > 3 && details.crew != "NULL") {
    $("#watch-crew").html(
      details.crew.map((crew) => crew.name + " (" + crew.job + ")").join(", ")
    );
  } else {
    $("#watch-crew").text("-");
  }
  // cast, the name of the person and the character
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
  // if moreInfo ends with a pipe, remove it
  if (moreInfo.endsWith(" | ")) {
    moreInfo = moreInfo.substring(0, moreInfo.length - 3);
  }
  $("#watch-more-info").html(moreInfo);
}

function getRecommended() {
  let watchId = getParamByName("id");
  // if id starts with s, it is a series, else it is a movie
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

  // get the details from the backend
  const backendUrl = window.backendUrl + `?type=${type}/${watchId}/recommendations`;

  let xhr = new XMLHttpRequest();
  xhr.open("GET", backendUrl, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let data = JSON.parse(xhr.responseText);
      logger.info("Recommended received", data);
      console.log(data);
      if (data.error) {
        invalidId(data.error);
        return;
      }
      // setRecommended(data, window.type);
      // insertIntoSwiper(wrapperId, type, data) 
      insertIntoSwiper("watch-recommended-wrapper", window.type, data);
      const swiper = document.getElementById("watch-recommended").swiper;
      swiper.updateSlides();


    }
  };
  xhr.send();
}

// function setRecommended(data, type) {
//     let recommendationsWrapper = document.getElementById("watch-recommended-wrapper");
//     if (!data || data.length < 3) {
//       logger.error("No data received from the backend");
//       return;
//     }
//     recommendationsWrapper.innerHTML = "";
//     // loop through the data and set the recommended movies
//     data.forEach((movie) => {
//         const movieSlide = document.createElement("div");
//         movieSlide.classList.add("trending-slide", "swiper-slide");
//         let title = movie.title.replace(/ /g, "-");
//         let urlId = movie.id;
//         if (type === "tv") {
//           urlId = "s" + urlId;
//         } else {
//           urlId = "m" + urlId;
//         }
//         let url = `details.html?id=${urlId}&${title}`;
//         movieSlide.innerHTML = `
//                                 <img src="${movie.poster}" alt="Movie Poster" class="movie-slide-poster" loading="lazy">
//                                 <div class="trending-shadow"></div>
//                                 <div class="trending-shadow2"></div>
//                                 <div class="trending-hover-title">${movie.title}</div>
//                                 <div class="trending-content">
//                                     <div class="trending-slide-rating d-flex justify-content-between">
//                                         <span>
//                                             <i class="fas fa-star"></i>
//                                             <span class="rating-value">${movie.rating}</span>
//                                         </span>
//                                         <span>
//                                             <i class="fas fa-calendar"></i>
//                                             <span class="rating-value">${movie.year}</span>
//                                         </span>
//                                     </div>
     
    
//                                     <div class="trending-slide-actions">
//                                     <a class="btn btn-primary" href="${url}">Watch</a>
//                                     <a class="btn btn-secondary" data-watchlistbtn="${urlId}"><i class="fas fa-plus"></i></a>
//                                 </div>
//                                 </div>
//                             `;
//                             recommendationsWrapper.appendChild(movieSlide);
    
//         // add event listener
//         movieSlide.addEventListener("mouseover", () => {
//           movieSlide.querySelector(".trending-hover-title").style.opacity = 1;
//         });
//         movieSlide.addEventListener("mouseout", () => {
//           movieSlide.querySelector(".trending-hover-title").style.opacity = 0;
//         });
    
//         // add mobile touch event
//         movieSlide.addEventListener("touchstart", () => {
//           movieSlide.querySelector(".trending-hover-title").style.opacity = 1;
//         });
//         movieSlide.addEventListener("touchend", () => {
//           movieSlide.querySelector(".trending-hover-title").style.opacity = 0;
//         });
// });
// }

function invalidId(message = "") {
  // For now, just log it
  logger.warn("An error occured: " + message);
}
