<?php

// Sorry for the mess. I am trying things out and I promise to clean it up someday. :)

include 'config.php';
header('Content-Type: application/json');

// if !isset get type
if (!isset($_GET['type']) || empty($_GET['type'])) {
    echo json_encode(array('status' => 'error', 'message' => 'No type provided'));
    exit;
}
$type = $_GET['type'];

// if isset get page, overwrite default page
if (isset($_GET['page']) && !empty($_GET['page'])) {
    $TMDB['page'] = $_GET['page'];
}

if (isset($_GET['cache']) && !empty($_GET['cache'])) {
    $TMDB['cache'] = $_GET['cache'];
}

if ($type == 'watchlist') {
    if (!isset($_POST['watchlist']) || empty($_POST['watchlist'])) {
        echo json_encode(array('status' => 'error', 'message' => 'No watchlist provided'));
        exit;
    }
    $watchlistIds = $_POST['watchlist'];
    // json_decode the watchlist
    $watchlistIds = json_decode($watchlistIds, true);
    $watchlist = array();
    $parsedResponse = array();
    $rawResponse = array();
    foreach ($watchlistIds as $id) {
        // if starts with m or starts with s
        // set the watchlist type to movie or tv and set the id to the id without the m or s
        if (strpos($id, 'm') === 0) {
            $watchlist[] = array('type' => 'movie', 'id' => substr($id, 1));
        } elseif (strpos($id, 's') === 0) {
            $watchlist[] = array('type' => 'tv', 'id' => substr($id, 1));
        }
    }

    // if list is longer than 40, split it into chunks of 40 and wait 2 seconds between each chunk
    // also check if the item is already in the cache, if so, add it to parsedResponse and delete it from the watchlist else parse the data and add it to parsedResponse
    foreach ($watchlist as $key => $item) {
        $type = $item['type'] . '/' . $item['id'];
        $response = getData($type);
        $response = json_decode($response, true);
        if (isset($response['cache']) && $response['cache'] == 'true') {
            $parsedResponse[] = $response;
            unset($watchlist[$key]);
        } else {
            $rawResponse[] = $response;
        }
        if ($key % 40 == 0 && $key != 0) {
            sleep(2);
        }
    }

    // if there are still items in the watchlist, save them to the cache


    // if there are items in response, parse them
    if (!empty($rawResponse)) {
        error_reporting(0);
        foreach ($rawResponse as $item) {
            $tempParsedResponse = array(
                'id' => $item['id'],
                'poster' => $TMDB['image_url'] . 'w500' . $item['poster_path'],
                'banner' => $TMDB['image_url'] . 'original' . $item['backdrop_path'],
                'description' => $item['overview'],
                'genres' => $item['genres'],
                'rating' => strpos($item['vote_average'], '.') ? number_format($item['vote_average'], 1) : $item['vote_average'] . '.0',
                'homepage' => $item['homepage'],
                'original_country' => $item['origin_country'][0],
                'original_language' => $item['original_language'],
                'production_companies' => $item['production_companies'],
                'crew' => [],
                'status' => $item['status'],
                'tagline' => $item['tagline'],
                'external_ids' => $item['external_ids'],
            );

            if (!isset($item['media_type']) || $item['media_type'] == 'movie') {
                $tempParsedResponse['runtime'] = $item['runtime'];
                $tempParsedResponse['title'] = $item['title'];
                $tempParsedResponse['release_date'] = $item['release_date'];
                $tempParsedResponse['year'] = substr($item['release_date'], 0, 4);
                $tempParsedResponse['original_title'] = $item['original_title'];
                $tempParsedResponse['type'] = 'movie';
            } else {
                $tempParsedResponse['title'] = $item['name'];
                $tempParsedResponse['release_date'] = $item['first_air_date'];
                $tempParsedResponse['year'] = substr($item['first_air_date'], 0, 4);
                $tempParsedResponse['runtime'] = '45'; // default runtime for tv shows is '45m'
                $tempParsedResponse['original_title'] = $item['original_name'];
                $tempParsedResponse['type'] = 'tv';
            }

            $runtimeText = '';
            // convert runtime to hours and minutes
            if ($tempParsedResponse['runtime'] > 60) {
                $hours = floor($parsedResponse['runtime'] / 60);
                $minutes = $parsedResponse['runtime'] % 60;
                $runtimeText = $hours . 'h ' . $minutes . 'm';
            } else {
                $runtimeText = $tempParsedResponse['runtime'] . 'm';
            }
            $tempParsedResponse['runtime_text'] = $runtimeText;

            // check if there is a trailer and if it is a youtube video
            if (isset($item['videos']['results']) && !empty($item['videos']['results'])) {
                // get the first video
                foreach ($item['videos']['results'] as $video) {
                    if ($video['site'] == 'YouTube') {
                        $tempParsedResponse['trailer'] = 'https://www.youtube.com/watch?v=' . $video['key'];
                        // embed, no cookies and privacy friendly, no tracking, no related videos
                        $tempParsedResponse['trailerEmbed'] = 'https://www.youtube-nocookie.com/embed/' . $video['key'] . '?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&controls=1&autoplay=1';
                        $tempParsedResponse['trailerId'] = $video['key'];
                        break;
                    }
                }
            }

            // get the age rating for the current country, if not found, get the us rating
            if (isset($item['release_dates']['results']) && !empty($item['release_dates']['results'])) {
                foreach ($item['release_dates']['results'] as $release) {
                    if ($release['iso_3166_1'] == $TMDB['region']) {
                        foreach ($release['release_dates'] as $date) {
                            if ($date['certification'] != '') {
                                $tempParsedResponse['age_rating'] = $date['certification'];
                                break;
                            }
                        }
                        break;
                    }
                }
                if (!isset($tempParsedResponse['age_rating'])) {
                    foreach ($item['release_dates']['results'] as $release) {
                        if ($release['iso_3166_1'] == 'US') {
                            $tempParsedResponse['age_rating'] = $release['release_dates'][0]['certification'];
                            break;
                        }
                    }
                }
            }
            // if (!isset($parsedResponse['age_rating']) || empty($parsedResponse['age_rating'])) {
            //     $parsedResponse['age_rating'] = 'N/A';
            // }

            // get the cast, but only the first 5 actors
            if (isset($item['credits']['cast']) && !empty($item['credits']['cast'])) {
                $tempParsedResponse['cast'] = array();
                foreach ($item['credits']['cast'] as $actor) {
                    $tempParsedResponse['cast'][] = array(
                        'name' => $actor['name'],
                        'character' => $actor['character'],
                        // 'profile' => $TMDB['image_url'] . 'w185' . $actor['profile_path'],
                    );
                    if (count($tempParsedResponse['cast']) == 25) {
                        break;
                    }
                }
            }

            if (isset($item['credits']['crew']) && !empty($item['credits']['crew'])) {
                $tempParsedResponse['crew'] = array();
                foreach ($item['credits']['crew'] as $crew) {
                    $tempParsedResponse['crew'][] = array(
                        'name' => $crew['name'],
                        'job' => $crew['job'],
                        // 'profile' => $TMDB['image_url'] . 'w185' . $crew['profile_path'],
                    );
                    if (count($tempParsedResponse['crew']) == 15) {
                        break;
                    }
                }
            }

            $parsedResponse[] = $tempParsedResponse;
            unset($tempParsedResponse);
        }
    }

    // save the parsedResponse to the cache
    saveCache($parsedResponse);

    $response = array();
    foreach ($parsedResponse as $item) {
        $response[] = array(
            'id' => $item['id'],
            'title' => $item['title'],
            'poster' => $item['poster'],
            'release_date' => $item['release_date'],
            'year' => $item['year'],
            'type' => $item['type'],
            'rating' => $item['rating'],
        );
    }

    die(json_encode($response));
} else {
    $response = getData($type);
}

if (!$response) {
    echo json_encode(array('status' => 'error', 'message' => 'No data found'));
    exit;
}

// die($response);

$parsedResponse = array();
$response = json_decode($response, true);

if (isset($response['cache']) && $response['cache'] == 'true') {
    echo json_encode($response);
    exit;
}

switch ($type) {
    case 'movie/popular': // popular movies
        if (!isset($response['results']) || empty($response['results'])) {
            echo json_encode(array('status' => 'error', 'message' => 'No results found'));
            exit;
        }
        foreach ($response['results'] as $result) {
            $parsedResponse[] = array(
                'id' => $result['id'],
                'title' => $result['title'],
                'poster' => $TMDB['image_url'] . 'w500' . $result['poster_path'],
                'release_date' => $result['release_date'],
                'type' => 'movie',
                'rating' => strpos($result['vote_average'], '.') ? number_format($result['vote_average'], 1) : $result['vote_average'] . '.0',
                'year' => substr($result['release_date'], 0, 4),
            );
        }
        break;
    case 'tv/popular': // popular tv shows
        if (!isset($response['results']) || empty($response['results'])) {
            echo json_encode(array('status' => 'error', 'message' => 'No results found'));
            exit;
        }
        foreach ($response['results'] as $result) {
            $parsedResponse[] = array(
                'id' => $result['id'],
                'title' => $result['name'],
                'poster' => $TMDB['image_url'] . 'w500' . $result['poster_path'],
                'release_date' => $result['first_air_date'],
                'type' => 'tv',
                'rating' => strpos($result['vote_average'], '.') ? number_format($result['vote_average'], 1) : $result['vote_average'] . '.0',
                'year' => substr($result['first_air_date'], 0, 4),
            );
        }
        break;
    case 'movie/now_playing':
        foreach ($response['results'] as $result) {
            $parsedResponse[] = array(
                'id' => $result['id'],
                'title' => $result['title'],
                'poster' => $TMDB['image_url'] . 'w500' . $result['poster_path'],
                'banner' => $TMDB['image_url'] . 'original' . $result['backdrop_path'],
                'description' => $result['overview'],
                'release_date' => $result['release_date'],
                'type' => 'movie',
                'rating' => strpos($result['vote_average'], '.') ? number_format($result['vote_average'], 1) : $result['vote_average'] . '.0',
                'year' => substr($result['release_date'], 0, 4),
            );

            // sort by rating
            // usort($parsedResponse, function ($a, $b) {
            //     return $b['rating'] <=> $a['rating'];
            // });

            // only keep top 5
            $parsedResponse = array_slice($parsedResponse, 0, 5);
        }
        break;
    case 'search/multi':
        $query = $_GET['query'];
        $response['query'] = $query;
        // die(json_encode($response));
        if (!isset($response['results']) || empty($response['results'])) {
            echo json_encode(array('status' => 'error', 'message' => 'No results found'));
            exit;
        }
        foreach ($response['results'] as $result) {
            if ($result['media_type'] == 'tv') {
                $prasedType = 'tv';
            } else if ($result['media_type'] == 'person') {
                continue;
            } else {
                $prasedType = 'movie';
            }


            $parsedResponse[] = array(
                'id' => $result['id'],
                'title' => $result['title'] ?? $result['name'],
                'poster' => $TMDB['image_url'] . 'w500' . $result['poster_path'],
                'release_date' => $result['release_date'] ?? $result['first_air_date'],
                'year' => substr($result['release_date'] ?? $result['first_air_date'], 0, 4),
                'type' => $prasedType,
                'rating' => strpos($result['vote_average'], '.') ? number_format($result['vote_average'], 1) : $result['vote_average'] . '.0',
            );

            // sort by rating
            // usort($parsedResponse, function ($a, $b) {
            //     return $b['rating'] <=> $a['rating'];
            // });

            // only keep top 5
            // $parsedResponse = array_slice($parsedResponse, 0, 5);
        }
        break;
        // if type is movie/[id containing only numbers]
    case ((preg_match('/^movie\/[0-9]+$/', $type) ? true : false) || (preg_match('/^tv\/[0-9]+$/', $type) ? true : false)):

        $parsedResponse = array(
            'id' => $response['id'],
            'poster' => $TMDB['image_url'] . 'w500' . $response['poster_path'],
            'banner' => $TMDB['image_url'] . 'original' . $response['backdrop_path'],
            'description' => $response['overview'],
            'genres' => $response['genres'],
            'rating' => strpos($response['vote_average'], '.') ? number_format($response['vote_average'], 1) : $response['vote_average'] . '.0',
            'homepage' => $response['homepage'],
            'original_country' => $response['origin_country'][0],
            'original_language' => $response['original_language'],
            'production_companies' => $response['production_companies'],
            'crew' => [],
            // 'watch_providers' => [],

            'status' => $response['status'],
            'tagline' => $response['tagline'],
            // 'trailer' => $response['videos']['results'],
            'external_ids' => $response['external_ids'],
        );

        if (strpos($type, 'movie') !== false) {
            $parsedResponse['runtime'] = $response['runtime'];
            $parsedResponse['title'] = $response['title'];
            $parsedResponse['release_date'] = $response['release_date'];
            $parsedResponse['year'] = substr($response['release_date'], 0, 4);
            $parsedResponse['original_title'] = $response['original_title'];
            $parsedResponse['type'] = 'movie';
        } else {
            $parsedResponse['title'] = $response['name'];
            $parsedResponse['release_date'] = $response['first_air_date'];
            $parsedResponse['year'] = substr($response['first_air_date'], 0, 4);
            $parsedResponse['runtime'] = '45'; // default runtime for tv shows is '45m'
            $parsedResponse['original_title'] = $response['original_name'];
            $parsedResponse['type'] = 'tv';
        }

        // die(json_encode($parsedResponse['runtime_text']));


        $runtimeText = '';
        // convert runtime to hours and minutes
        if ($parsedResponse['runtime'] > 60) {
            $hours = floor($parsedResponse['runtime'] / 60);
            $minutes = $parsedResponse['runtime'] % 60;
            $runtimeText = $hours . 'h ' . $minutes . 'm';
        } else {
            $runtimeText = $parsedResponse['runtime'] . 'm';
        }
        $parsedResponse['runtime_text'] = $runtimeText;

        // check if there is a trailer and if it is a youtube video
        if (isset($response['videos']['results']) && !empty($response['videos']['results'])) {
            // get the first video
            foreach ($response['videos']['results'] as $video) {
                if ($video['site'] == 'YouTube') {
                    $parsedResponse['trailer'] = 'https://www.youtube.com/watch?v=' . $video['key'];
                    // embed, no cookies and privacy friendly, no tracking, no related videos
                    $parsedResponse['trailerEmbed'] = 'https://www.youtube-nocookie.com/embed/' . $video['key'] . '?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&controls=1&autoplay=1';
                    $parsedResponse['trailerId'] = $video['key'];
                    break;
                }
            }
        }

        // get the age rating for the current country, if not found, get the us rating
        if (isset($response['release_dates']['results']) && !empty($response['release_dates']['results'])) {
            foreach ($response['release_dates']['results'] as $release) {
                if ($release['iso_3166_1'] == $TMDB['region']) {
                    foreach ($release['release_dates'] as $date) {
                        if ($date['certification'] != '') {
                            $parsedResponse['age_rating'] = $date['certification'];
                            break;
                        }
                    }
                    break;
                }
            }
            if (!isset($parsedResponse['age_rating'])) {
                foreach ($response['release_dates']['results'] as $release) {
                    if ($release['iso_3166_1'] == 'US') {
                        $parsedResponse['age_rating'] = $release['release_dates'][0]['certification'];
                        break;
                    }
                }
            }
        }
        // if (!isset($parsedResponse['age_rating']) || empty($parsedResponse['age_rating'])) {
        //     $parsedResponse['age_rating'] = 'N/A';
        // }

        // get the cast, but only the first 5 actors
        if (isset($response['credits']['cast']) && !empty($response['credits']['cast'])) {
            $parsedResponse['cast'] = array();
            foreach ($response['credits']['cast'] as $actor) {
                $parsedResponse['cast'][] = array(
                    'name' => $actor['name'],
                    'character' => $actor['character'],
                    // 'profile' => $TMDB['image_url'] . 'w185' . $actor['profile_path'],

                );
                if (count($parsedResponse['cast']) == 25) {
                    break;
                }
            }
        }
        if (isset($response['credits']['crew']) && !empty($response['credits']['crew'])) {
            $parsedResponse['crew'] = array();
            foreach ($response['credits']['crew'] as $crew) {
                $parsedResponse['crew'][] = array(
                    'name' => $crew['name'],
                    'job' => $crew['job'],
                    // 'profile' => $TMDB['image_url'] . 'w185' . $crew['profile_path'],
                );
                if (count($parsedResponse['crew']) == 15) {
                    break;
                }
            }
        }

        // die(json_encode($response['watch/providers']));

        // get the watch providers
        if (isset($response['watch/providers']['results']) && !empty($response['watch/providers']['results'])) {
            // check if watch providers are available in the current region, if not use the us providers
            if (isset($response['watch/providers']['results'][$TMDB['region']])) {
                $watchProviders = $response['watch/providers']['results'][$TMDB['region']];
            } else {
                $watchProviders = $response['watch/providers']['results']['US'];
            }
            // die(json_encode($watchProviders));
            $parsedResponse['watch_providers'] = array();
            // loop through the arrays inside the watch providers, e.g. flatrate, rent, buy
            // foreach ($watchProviders as $key => $provider) {
            //     // if is link, skip it
            //     if ($key == 'link') {
            //         continue;
            //     }
            //     $parsedResponse['watch_providers'][$key] = array();
            //     foreach ($provider as $item) {
            //         $parsedResponse['watch_providers'][$key][] = array(
            //             'display_priority' => $item['display_priority'],
            //             'logo' => $TMDB['image_url'] . 'w92' . $item['logo_path'],
            //             'provider_id' => $item['provider_id'],
            //             'provider_name' => $item['provider_name'],
            //         );
            //     }
            // }

            // merge the arrays into one
            $parsedResponse['watch_providers'] = array();
            foreach ($watchProviders as $key => $provider) {
                if ($key == 'link') {
                    continue;
                }
                foreach ($provider as $item) {
                    $parsedResponse['watch_providers'][] = array(
                        'display_priority' => $item['display_priority'],
                        'logo' => $TMDB['image_url'] . 'w92' . $item['logo_path'],
                        'provider_id' => $item['provider_id'],
                        'provider_name' => $item['provider_name'],
                        'link' => '',
                    );
                }
            }

            // sort the watch providers by display priority
            usort($parsedResponse['watch_providers'], function ($a, $b) {
                return $a['display_priority'] <=> $b['display_priority'];
            });

            // remove duplicates (same provider_id)
            $parsedResponse['watch_providers'] = array_map("unserialize", array_unique(array_map("serialize", $parsedResponse['watch_providers'])));


            // die(json_encode($parsedResponse['watch_providers']));


        } else {
            $parsedResponse['watch_providers'] = [];
        }


        break;

        // recommend, e.g. movie/123/recommendations or tv/123/recommendations
    case ((preg_match('/^movie\/[0-9]+\/recommendations$/', $type) ? true : false) || (preg_match('/^tv\/[0-9]+\/recommendations$/', $type) ? true : false)):
        if (!isset($response['results']) || empty($response['results'])) {
            echo json_encode(array('status' => 'error', 'message' => 'No results found'));
            exit;
        }
        // die(json_encode($response));
        foreach ($response['results'] as $result) {
            if (isset($result['media_type']) && $result['media_type'] == 'tv') {
                $prasedType = 'tv';

                $tempResponse['title'] = $result['name'];
                $tempResponse['release_date'] = $result['first_air_date'];
                $tempResponse['year'] = substr($result['first_air_date'], 0, 4);
            } else {

                $tempResponse['title'] = $result['title'];
                $tempResponse['release_date'] = $result['release_date'];
                $tempResponse['year'] = substr($result['release_date'], 0, 4);
                $prasedType = 'movie';
            }

            $parsedResponse[] = array(
                'id' => $result['id'],
                'title' => $tempResponse['title'],
                'poster' => $TMDB['image_url'] . 'w500' . $result['poster_path'],
                'release_date' => $tempResponse['release_date'],
                'year' => $tempResponse['year'],

                'type' => $prasedType,
                'rating' => strpos($result['vote_average'], '.') ? number_format($result['vote_average'], 1) : $result['vote_average'] . '.0',
            );
            unset($tempResponse);
        }
        break;


    default:
        echo json_encode(array('status' => 'error', 'message' => 'Invalid type'));
        exit;
        break;
}

// if possible try gzip compression or brotli, but only if the client supports it
// if (extension_loaded('brotli') && function_exists('brotli_compress') && isset($_SERVER['HTTP_ACCEPT_ENCODING']) && strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'br') !== false) {
//     ob_start('ob_brotli');
// } elseif (extension_loaded('zlib') && function_exists('gzencode') && isset($_SERVER['HTTP_ACCEPT_ENCODING']) && strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== false) {
//     ob_start('ob_gzhandler');
// }

saveCache($parsedResponse);

echo json_encode($parsedResponse);
exit;


function saveCache($data)
{
    // create table is not exists
    /*
    what should the table structure be for the cache? I want to have seperate tables for movies and tv. Also it should save each movie and series detail that is fetched by the api. An expiration should also be set (by using the current timestamp). Also the ids of the popular movies/series should be saved so they can be fetched from the other table. I have pdo with sqlite3.
    */
    global $db;
    global $TMDB; // for cache_time


    // check if the data contains only one item or multiple
    if (count($data) == count($data, COUNT_RECURSIVE)) {
        // echo "single \n";
    } else {
        // echo "multiple \n";
    }

    // check if is single or multiple, by checking if the first key is 0 and ['id'] is not set in the first item
    if (isset($data['id']) && !isset($data[0]['id'])) {
        $data = array($data);
        // echo "converted to array \n";
    } else {
        // echo "already an array \n";
    }

    // die(json_encode($data));

    // disable error reporting temporarily
    error_reporting(0);

    // save the data
    foreach ($data as $item) {

        // check if the item already exists
        $stmt = $db->prepare('SELECT * FROM ' . $item['type'] . ' WHERE tmdb_id = :tmdb_id');
        $stmt->bindParam(':tmdb_id', $item['id']);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        // compare the created_at timestamp with the current timestamp and 
        if ($result && strtotime($result['created_at']) + $TMDB['cache_time'] > time()) {
            // if(1 == 2) {
            // if the item exists and is not expired, skip it
            // echo "skipped '" . $item['id'] . "' \n";
            $nulls = 0;
            foreach ($result as $key => $value) {
                if ($value == 'NULL') {
                    $nulls++;
                }
            }
            if ($nulls < 5) {
                continue;
            }
        }
        // if the item exists but is expired, delete it
        if ($result) {
            $stmt = $db->prepare('DELETE FROM ' . $item['type'] . ' WHERE tmdb_id = :tmdb_id');
            $stmt->bindParam(':tmdb_id', $item['id']);
            $stmt->execute();
        }
        // echo "saving '" . $item['id'] . "' \n";

        $template = array(
            'id' => 'NULL',
            'tmdb_id' => 'NULL',
            'title' => 'NULL',
            'poster' => 'NULL',
            'banner' => 'NULL',
            'description' => 'NULL',
            'release_date' => 'NULL',
            'type' => 'NULL',
            'rating' => 'NULL',
            'year' => 'NULL',
            'runtime' => 'NULL',
            'runtime_text' => 'NULL',
            'age_rating' => 'NULL',
            'genres' => 'NULL',
            'homepage' => 'NULL',
            'original_country' => 'NULL',
            'original_language' => 'NULL',
            'original_title' => 'NULL',
            'production_companies' => 'NULL',
            'crew' => 'NULL',
            'status' => 'NULL',
            'tagline' => 'NULL',
            'trailer' => 'NULL',
            'trailerEmbed' => 'NULL',
            'trailerId' => 'NULL',
            'external_ids' => 'NULL',
            'cast' => 'NULL',
            'watch_providers' => 'NULL', // array
            'created_at' => 'NULL',

        );

        // merge the template with the item, if the item does not have a key, it will be null, else always the value of the item
        $item = array_merge($template, $item);

        // die(json_encode($item));


        $stmt = $db->prepare('INSERT INTO ' . $item['type'] . ' (tmdb_id, title, poster, banner, description, release_date, type, rating, year, runtime, runtime_text, age_rating, genres, homepage, original_country, original_language, original_title, production_companies, crew, status, tagline, trailer, trailerEmbed, trailerId, external_ids, cast, watch_providers, created_at) VALUES (:tmdb_id, :title, :poster, :banner, :description, :release_date, :type, :rating, :year, :runtime, :runtime_text, :age_rating, :genres, :homepage, :original_country, :original_language, :original_title, :production_companies, :crew, :status, :tagline, :trailer, :trailerEmbed, :trailerId, :external_ids, :cast, :watch_providers, :created_at)');
        $stmt->bindParam(':tmdb_id', $item['id']);
        $stmt->bindParam(':title', $item['title']);
        $stmt->bindParam(':poster', $item['poster']);
        $stmt->bindParam(':banner', $item['banner']);
        $stmt->bindParam(':description', $item['description']);
        $stmt->bindParam(':release_date', $item['release_date']);
        $stmt->bindParam(':type', $item['type']);
        $stmt->bindParam(':rating', $item['rating']);
        $stmt->bindParam(':year', $item['year']);
        $stmt->bindParam(':runtime', $item['runtime']);
        $stmt->bindParam(':runtime_text', $item['runtime_text']);
        $stmt->bindParam(':age_rating', $item['age_rating']);
        $stmt->bindParam(':genres', json_encode($item['genres']));
        $stmt->bindParam(':homepage', $item['homepage']);
        $stmt->bindParam(':original_country', $item['original_country']);
        $stmt->bindParam(':original_language', $item['original_language']);
        $stmt->bindParam(':original_title', $item['original_title']);
        $stmt->bindParam(':production_companies', json_encode($item['production_companies']));
        $stmt->bindParam(':crew', json_encode($item['crew']));
        $stmt->bindParam(':status', $item['status']);
        $stmt->bindParam(':tagline', $item['tagline']);
        $stmt->bindParam(':trailer', $item['trailer']);
        $stmt->bindParam(':trailerEmbed', $item['trailerEmbed']);
        $stmt->bindParam(':trailerId', $item['trailerId']);
        $stmt->bindParam(':external_ids', json_encode($item['external_ids']));
        $stmt->bindParam(':cast', json_encode($item['cast']));
        $stmt->bindParam(':watch_providers', json_encode($item['watch_providers']));
        $stmt->bindParam(':created_at', date('Y-m-d H:i:s'));
        $stmt->execute();

        // echo "saved \n";
    }

    error_reporting(E_ALL);
}


function getData($type)
{
    global $TMDB;
    global $type;
    global $db;
    $additional = 'id,videos,credits,external_ids,release_dates,content_ratings,episode_run_time,media_type';

    if (preg_match('/^movie\/[0-9]+$/', $type) || preg_match('/^tv\/[0-9]+$/', $type)) {
        $additional = $additional . ',watch/providers';
    }
    // die($additional);

    // if type includes is search/multi, add $_GET['query'] to the url
    if ($type == 'search/multi') {
        if (!isset($_GET['query']) || empty($_GET['query'])) {
            echo json_encode(array('status' => 'error', 'message' => 'No query provided'));
            exit;
        }
        $additional = $additional . '&query=' . urlencode($_GET['query']);
    }

    // if type includes is movie/[id containing only numbers] or tv/[id containing only numbers] and
    if ($TMDB['cache'] == 'true') {
        if (preg_match('/^movie\/[0-9]+$/', $type) || preg_match('/^tv\/[0-9]+$/', $type)) {
            $id = explode('/', $type)[1];
            $cacheType = explode('/', $type)[0];
            // echo $id;

            $stmt = $db->prepare('CREATE TABLE IF NOT EXISTS movie (id INTEGER PRIMARY KEY, tmdb_id INTEGER, title TEXT, poster TEXT, banner TEXT, description TEXT, release_date TEXT, type TEXT, rating TEXT, year TEXT, runtime TEXT, runtime_text TEXT, age_rating TEXT, genres TEXT, homepage TEXT, original_country TEXT, original_language TEXT, original_title TEXT, production_companies TEXT, crew TEXT, status TEXT, tagline TEXT, trailer TEXT, trailerEmbed TEXT, trailerId TEXT, external_ids TEXT, cast TEXT, watch_providers TEXT, created_at TEXT)');
            $stmt->execute();

            $stmt = $db->prepare('CREATE TABLE IF NOT EXISTS tv (id INTEGER PRIMARY KEY, tmdb_id INTEGER, title TEXT, poster TEXT, banner TEXT, description TEXT, release_date TEXT, type TEXT, rating TEXT, year TEXT, runtime TEXT, runtime_text TEXT, age_rating TEXT, genres TEXT, homepage TEXT, original_country TEXT, original_language TEXT, original_title TEXT, production_companies TEXT, crew TEXT, status TEXT, tagline TEXT, trailer TEXT, trailerEmbed TEXT, trailerId TEXT, external_ids TEXT, cast TEXT, watch_providers TEXT, created_at TEXT)');
            $stmt->execute();

            // echo $type;
            $stmt = $db->prepare('SELECT * FROM ' . $cacheType . ' WHERE tmdb_id = :tmdb_id');
            $stmt->bindParam(':tmdb_id', $id);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            // count the number of NULL values in the result



            // die("already in cache");
            if ($result && strtotime($result['created_at']) + $TMDB['cache_time'] > time() && $result['watch_providers'] != "\"NULL\"" && $result['watch_providers'] != 'NULL') {
                $nulls = 0;
                foreach ($result as $key => $value) {
                    if ($value == 'NULL') {
                        $nulls++;
                    }
                }

                if ($nulls < 5) {
                    $result['cache'] = 'true';
                    // json decode the genres and production_companies,...
                    $result['genres'] = json_decode($result['genres'], true);
                    $result['production_companies'] = json_decode($result['production_companies'], true);
                    $result['crew'] = json_decode($result['crew'], true);
                    $result['external_ids'] = json_decode($result['external_ids'], true);
                    $result['cast'] = json_decode($result['cast'], true);
                    $result['watch_providers'] = json_decode($result['watch_providers'], true);
                    $result['id'] = $result['tmdb_id'];

                    return json_encode($result);
                }
            }
        }
    }

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $TMDB['api_url'] . $type . '?include_adult=' . $TMDB['include_adult'] . '&include_video=' . $TMDB['include_video'] . '&language=' . $TMDB['language'] . '&region=' . $TMDB['region'] . '&page=' . $TMDB['page'] . '&sort_by=' . $TMDB['sort_by'] . '&append_to_response=' . $additional,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_HTTPHEADER => array(
            $TMDB['api_key_header'],
            $TMDB['accept_header']
        ),
    ));

    $response = curl_exec($curl);
    // die($response);

    curl_close($curl);
    return $response;
}
