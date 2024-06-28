function searchInit() {
  // get the search from the url
  const search = getParamByName("q");
  // set the search input value
  $("#search-input").val(search);
  $("#search-query").text(search);

  search_getResults(search);
}

function search_getResults(search) {
  // get the search results
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

function search_insertResults(data) {
  // get the search results wrapper
  // clear the wrapper

  // if data.status is error, show error message


  console.log(data);
  let wrapper = $("#search-results-wrapper");
  if (data.status === "error") {
    wrapper.html(
      `<div class="alert alert-primary" role="alert">${data.message}</div>`
    );
    return;
  }

  if (!data || data.length < 3) {
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


// search-submit-btn click event
$("#search-submit-btn").click(function () {
  const search = $("[data-search='input']").val();
  search_getResults(search);
});