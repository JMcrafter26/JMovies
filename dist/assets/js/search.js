/**
 * The `searchInit` function initializes the search functionality by retrieving the search query
 * parameter, updating the search input field and displaying the search query text.
 */
function searchInit() {
  const search = getParamByName("q");
  $("#search-input").val(search);
  $("#search-query").text(search);

  search_getResults(search);
}

/**
 * The function `search_getResults` sends a GET request to a backend URL with a search query and
 * processes the response.
 * @param search - The `search_getResults` function takes a `search` parameter, which is the query
 * string used to search for results. This parameter is used to construct the backend URL for the
 * search request.
 */
function search_getResults(search) {
  const backend =
    window.backendUrl +
    "?type=search/multi&query=" + search;
  let xhr = new XMLHttpRequest();
  xhr.open("GET", backend, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      search_insertResults(JSON.parse(xhr.responseText));
    }
  };
  xhr.send();
}

/**
 * The function `search_insertResults` displays search results in a specified wrapper element based on
 * the data received from the backend, including movie or TV show details with options to watch and add
 * to a watchlist.
 * @param data - The `search_insertResults` function takes in a `data` parameter, which is expected to
 * be an object containing information about search results. The function then processes this data to
 * display search results on a webpage.
 * @returns The `search_insertResults` function processes the data received from the backend and
 * dynamically creates HTML elements to display search results. If the data status is an error, it
 * displays an alert message. If no data is received or the data length is less than 1, it logs an
 * error message. Otherwise, it iterates over the data array, creates HTML elements for each item, and
 * appends them
 */
function search_insertResults(data) {
  console.log(data);
  let wrapper = $("#search-results-wrapper");
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
    const wrapperChild = $("<div>").addClass(
      "trending-slide swiper-slide hover-poster"
    );
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


$("#search-submit-btn").click(function () {
  const search = $("[data-search='input']").val();
  search_getResults(search);
});