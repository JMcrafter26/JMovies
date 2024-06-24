function watchInit() {
    // if the play button is clicked, show the trailer
    $('#playTrailer').click(function() {
        $('.trailer').addClass('active');
    });

    // if the close button is clicked, hide the trailer
    $('#closeTrailer').click(function() {
        $('.trailer').removeClass('active');
    });

    // if clicked outside the trailer, hide the trailer
    $('.trailer').click(function(e) {
        if ($(e.target).hasClass('trailer')) {
            $('.trailer').removeClass('active');
        }
    });




// if the recommended button is clicked, show the recommended movies
$('#recommendedBtn').click(function() {
    $('#recommendedBtn').addClass('active');
    $('#detailsBtn').removeClass('active');
    $('#recommended-movies-container').removeClass('d-none');
    $('#details-movies-container').addClass('d-none');

    // remove hash from the url
    let url = new URL(window.location.href);
    url.hash = '';
    // push the new url without hash
    window.history.pushState({}, document.title, url);
});

// if the details button is clicked, show the details
$('#detailsBtn').click(function() {
    $('#detailsBtn').addClass('active');
    $('#recommendedBtn').removeClass('active');
    $('#details-movies-container').removeClass('d-none');
    $('#recommended-movies-container').addClass('d-none');

    // add hash #details to the url
    window.location.hash = 'details';
});

    // if hash is details, show the details
    if (window.location.hash == '#details') {
        $('#detailsBtn').click();
    }

}

