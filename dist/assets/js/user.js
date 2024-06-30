/**
 * The userInit function initializes user actions such as clearing watchlist and history, and fetching
 * watchlist and recent items.
 */
function userInit() {
  logger.debug("User init started");

  $("#clear-watchlist").click(function () {
    if (confirm("Are you sure you want to clear your watchlist?")) {
        clearWatchlist();
        user_getWatchlist();
        }
    });

    $("#clear-recently-viewed").click(function () {
        if (confirm("Are you sure you want to clear your history?")) {
            clearHistory();
            user_getRecent();
        }
        }
    );

  user_getWatchlist();
  user_getRecent();
}

/**
 * The function `user_getWatchlist` retrieves the user's watchlist, checks if it's empty, and sends a
 * POST request to the backend with the watchlist data.
 * @returns The `user_getWatchlist` function returns the user's watchlist data after making a POST
 * request to the backend server with the watchlist information. If the watchlist is empty, it will
 * display a message indicating that the watchlist is empty. If the request is successful (status code
 * 200), it will insert the watchlist data into the specified element on the webpage.
 */
function user_getWatchlist() {
  let watchlist = getWatchlist();
  console.log(watchlist);
  logger.info("Watchlist: " + watchlist);

  if (watchlist.length < 1) {
    $("#user-watchlist-wrapper").empty();
    $("#user-watchlist-wrapper").text("Your watchlist is empty.");
    return;
  }
  logger.info("Watchlist length: " + watchlist.length);
  const backend = window.backendUrl + "?type=watchlist";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", backend, true);
  xhr.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      user_insert(JSON.parse(xhr.responseText), $("#user-watchlist-wrapper"));
    }
  };

  xhr.send("watchlist=" + JSON.stringify(watchlist));
}

/**
 * The function `user_getRecent` retrieves recent data, logs it, and sends it to the backend for
 * further processing.
 * @returns The `user_getRecent` function is making a POST request to a backend URL with recent data
 * and then calling the `user_insert` function with the response data to update the
 * user-recently-viewed-wrapper element.
 */
function user_getRecent() {
  let recent = getRecent();
  console.log(recent);
  logger.info("Recent: " + recent);

  if (recent.length < 1) {
    $("#user-recently-viewed-wrapper").empty();
    $("#user-recently-viewed-wrapper").text("Your recent is empty.");
    return;
  }
  logger.info("Recent length: " + recent.length);
  const backend = window.backendUrl + "?type=watchlist";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", backend, true);
  xhr.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      user_insert(JSON.parse(xhr.responseText), $("#user-recently-viewed-wrapper"));
    }
  };

  xhr.send("watchlist=" + JSON.stringify(recent));
}

/**
 * The function `user_insert` processes data received from the backend and dynamically creates HTML
 * elements based on the data to display movie or TV show information with watchlist functionality.
 * @param data - The `data` parameter in the `user_insert` function is the data received from the
 * backend. It contains information about movies or TV shows such as title, id, type, poster, rating,
 * year, etc. This data is used to dynamically create and insert elements into the specified `wrapper`
 * @param wrapper - The `wrapper` parameter in the `user_insert` function is a jQuery object that
 * represents the element where the data will be inserted. It is used to dynamically create and append
 * HTML elements based on the data received.
 * @returns The `user_insert` function is returning nothing explicitly, as it does not have a `return`
 * statement at the end of the function. It mainly performs operations like checking the status of the
 * data, handling error messages, and dynamically creating HTML elements based on the data received.
 */
function user_insert(data, wrapper) {
  console.log(data);
  if (data.status === "error") {
    wrapper.html(
      `<div class="alert alert-primary" role="alert">${data.message}</div>`
    );
    return;
  }

  if (!data || data.length < 1) {
    console.error("No data received from the backend");
    return;
  }

  wrapper.empty();
  $.each(data, function (index, data) {
    const wrapperChild = $("<div>").addClass("trending-slide hover-poster");
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
