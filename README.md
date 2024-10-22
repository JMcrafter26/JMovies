# JMovies - TMDB Library

![dist/assets/image/logo/logo.png](dist/assets/image/logo/logo.png)

This repo is for my school project. It is a movie library that allows users to search for movies, view movie details, and add movies to their watchlist.

It's mainly inspired by the [IMDb](https://www.imdb.com/) and [Letterboxd](https://letterboxd.com/) websites.

> :warning: **This project is still in development. Things may change. Also, some features are not implemented yet and cleanup is needed.**
> **This project is for educational purposes only and not affiliated with IMDb or Letterboxd or anything else.**

## Features

> :warning: **Some features are not implemented yet.**

- :mag: Search for movies
- :clapper: View movie details
- :heavy_plus_sign: Add movies to watchlist
- :eye: View watchlist
- :x: Remove movies from watchlist
- :star: Rate movies
- :pencil2: Write reviews/comments
- :speech_balloon: View reviews/comments
- :wink: More features to come

## Tech Stack

I wanted to keep things simple, so I chose to use the following technologies:

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP

### Used technologies

#### Frontend

- **Bootswatch**: Bootstrap theme
  - **Bootstrap**: CSS framework
- **jQuery**: JavaScript library
- **Swiper**: JavaScript slider library
- **FontAwesome**: Icon library
- **Icons8**: Icon library, especially for the logo

#### Backend

- **Composer**: PHP dependency manager
- **The Movie Database (TMDb) API**: Movie database API

## Installation

1. Clone the repo
2. Inside `backend/`, rename  `config.php.example` to `config.php`
3. Paste your TMDb API key in `config.php`
4. Start your PHP server (`php -S localhost:8000`)
5. Open the browser and go to `http://localhost:8000`. Done :tada:

## License and Credits

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

- **Logo**: [Icons8](https://icons8.com/)
- **API**: [The Movie Database (TMDb)](https://www.themoviedb.org/)
- **Inspiration**: [IMDb](https://www.imdb.com/), [Letterboxd](https://letterboxd.com/)
- **Icons**: [FontAwesome](https://fontawesome.com/), [Icons8](https://icons8.com/)
- **Slider**: [Swiper](https://swiperjs.com/)
- **CSS Framework**: [Bootstrap](https://getbootstrap.com/)
- **JavaScript Library**: [jQuery](https://jquery.com/)
