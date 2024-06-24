<?php

include 'config.php';

header('Content-Type: application/json');

// if !isset get type
if (!isset($_GET['type']) || empty($_GET['type'])) {
    echo json_encode(array('status' => 'error', 'message' => 'No type provided'));
    exit;
}

// if isset get page, overwrite default page
if (isset($_GET['page']) && !empty($_GET['page'])) {
    $TMDB['page'] = $_GET['page'];
}

// $response = getData('movie/popular');
$response = getData($_GET['type']);
if (!$response) {
    echo json_encode(array('status' => 'error', 'message' => 'No data found'));
    exit;
}


$parsedResponse = array();
$response = json_decode($response, true);

if (!isset($response['results']) || empty($response['results'])) {
    echo json_encode(array('status' => 'error', 'message' => 'No results found'));
    exit;
}

switch ($_GET['type']) {
    case 'movie/popular': // popular movies
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
}

echo json_encode($parsedResponse);
exit;





function getData($type)
{
    global $TMDB;
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $TMDB['api_url'] . $type . '?include_adult=' . $TMDB['include_adult'] . '&include_video=' . $TMDB['include_video'] . '&language=' . $TMDB['language'] . '&region=' . $TMDB['region'] . '&page=' . $TMDB['page'] . '&sort_by=' . $TMDB['sort_by'] . '&append_to_response=id',
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

    curl_close($curl);
    return $response;
}
