<?php

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

// $response = getData('movie/popular');
$response = getData($type);
if (!$response) {
    echo json_encode(array('status' => 'error', 'message' => 'No data found'));
    exit;
}

// die($response);

$parsedResponse = array();
$response = json_decode($response, true);





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
                    // 'overview' => $result['overview'],
                    'release_date' => $result['release_date'],
                    // round rating to nearest 0.1, e.g. 7.666666666666667 -> 7.7; if rating is does not includes a period, add '.0' to the end
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
                    // 'overview' => $result['overview'],
                    'release_date' => $result['first_air_date'],
                    // round rating to nearest 0.1, e.g. 7.666666666666667 -> 7.7; if rating is does not includes a period, add '.0' to the end
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
                    // 'overview' => $result['overview'],
                    'description' => $result['overview'],
                    'release_date' => $result['release_date'],
                    // round rating to nearest 0.1, e.g. 7.666666666666667 -> 7.7; if rating is does not includes a period, add '.0' to the end
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

                'status' => $response['status'],
                'tagline' => $response['tagline'],
                // 'trailer' => $response['videos']['results'],
                'external_ids' => $response['external_ids'],
            );

            if(strpos($type, 'movie') !== false) {
                $parsedResponse['runtime'] = $response['runtime'];
                $parsedResponse['title'] = $response['title'];
                $parsedResponse['release_date'] = $response['release_date'];
                $parsedResponse['year'] = substr($response['release_date'], 0, 4);
                $parsedResponse['original_title'] = $response['original_title'];
                
            } else {
                $parsedResponse['title'] = $response['name'];
                $parsedResponse['release_date'] = $response['first_air_date'];
                $parsedResponse['year'] = substr($response['first_air_date'], 0, 4);
                $parsedResponse['runtime'] = '45'; // default runtime for tv shows is '45m'
                $parsedResponse['original_title'] = $response['original_name'];

            }

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
            if (!isset($parsedResponse['age_rating']) || empty($parsedResponse['age_rating'])) {
                $parsedResponse['age_rating'] = 'NA';
            }

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

        break;
        // if type is tv/[id containing only numbers]
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

echo json_encode($parsedResponse);
exit;





function getData($type)
{
    global $TMDB;
    global $type;
    if(preg_match('/^movie\/[0-9]+$/', $type) || preg_match('/^tv\/[0-9]+$/', $type)) {
        $additional = 'id,videos,credits,external_ids,release_dates,content_ratings,episode_run_time';
    } else {
        $additional = 'id';
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
