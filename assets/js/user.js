function userInit() {
  logger.debug("User init started");

  $("#clear-watchlist").click(function () {
    // show confirmation dialog
    if (confirm("Are you sure you want to clear your watchlist?")) {
        clearWatchlist();
        user_getWatchlist();
        }
    });

    $("#clear-recently-viewed").click(function () {
        // show confirmation dialog
        if (confirm("Are you sure you want to clear your history?")) {
            clearHistory();
            user_getRecent();
        }
        }
    );

  user_getWatchlist();
  user_getRecent();
}

function user_getWatchlist() {
  let watchlist = getWatchlist();
  console.log(watchlist);
  logger.info("Watchlist: " + watchlist);

  // if the watchlist is empty, remove the watchlist section. watchlist is an []
  if (watchlist.length < 1) {
    // empty watchlist section
    $("#user-watchlist-wrapper").empty();
    $("#user-watchlist-wrapper").text("Your watchlist is empty.");
    return;
  }
  logger.info("Watchlist length: " + watchlist.length);
  // We do not save any data in the backend. The backend is only used to get the watchlist data from the Movie API.
  const backend = window.backendUrl + "?type=watchlist";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", backend, true);
  // xhr.setRequestHeader("Content-Type", "application/json");
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

function user_getRecent() {
  let recent = getRecent();
  console.log(recent);
  logger.info("Recent: " + recent);

  // if the recent is empty, remove the recent section. recent is an []
  if (recent.length < 1) {
    // empty recent section
    $("#user-recently-viewed-wrapper").empty();
    $("#user-recently-viewed-wrapper").text("Your recent is empty.");
    return;
  }
  logger.info("Recent length: " + recent.length);
  // We do not save any data in the backend. The backend is only used to get the recent data from the Movie API.
  const backend = window.backendUrl + "?type=watchlist";
  let xhr = new XMLHttpRequest();
  xhr.open("POST", backend, true);
  // xhr.setRequestHeader("Content-Type", "application/json");
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
