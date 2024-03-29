<?php


function aws_s3_link($access_key, $secret_key, $bucket, $canonical_uri, $expires, $region, $extra_headers) {
    $encoded_uri = str_replace('%2F', '/', rawurlencode($canonical_uri));

    $signed_headers = array();
    foreach ($extra_headers as $key => $value) {
        $signed_headers[strtolower($key)] = $value;
    }
    if (!array_key_exists('host', $signed_headers)) {
        $signed_headers['host'] = ($region == 'us-east-1') ? "$bucket.s3.amazonaws.com" : "$bucket.s3-$region.amazonaws.com";
    }
    ksort($signed_headers);

    $header_string = '';
    foreach ($signed_headers as $key => $value) {
        $header_string .= $key . ':' . trim($value) . "\n";
    }
    $signed_headers_string = implode(';', array_keys($signed_headers));

    $timestamp = time();
    $date_text = gmdate('Ymd', $timestamp);
    $time_text = $date_text . 'T000000Z';

    $algorithm = 'AWS4-HMAC-SHA256';
    $scope = "$date_text/$region/s3/aws4_request";

    $x_amz_params = array(
        'X-Amz-Algorithm' => $algorithm,
        'X-Amz-Credential' => $access_key . '/' . $scope,
        'X-Amz-Date' => $time_text,
        'X-Amz-SignedHeaders' => $signed_headers_string
    );
    if ($expires > 0) $x_amz_params['X-Amz-Expires'] = $expires;
    ksort($x_amz_params);

    $query_string_items = array();
    foreach ($x_amz_params as $key => $value) {
        $query_string_items[] = rawurlencode($key) . '=' . rawurlencode($value);
    }
    $query_string = implode('&', $query_string_items);

    $canonical_request = "GET\n$encoded_uri\n$query_string\n$header_string\n$signed_headers_string\nUNSIGNED-PAYLOAD";
    $string_to_sign = "$algorithm\n$time_text\n$scope\n" . hash('sha256', $canonical_request, false);
    $signing_key = hash_hmac('sha256', 'aws4_request', hash_hmac('sha256', 's3', hash_hmac('sha256', $region, hash_hmac('sha256', $date_text, 'AWS4' . $secret_key, true), true), true), true);
    $signature = hash_hmac('sha256', $string_to_sign, $signing_key);

    $url = 'https://' . $signed_headers['host'] . $encoded_uri . '?' . $query_string . '&X-Amz-Signature=' . $signature;
    $return = array();
    $return["url"] = $url;
    echo json_encode($return);
}

$title = $_GET["title"];
$title_with_slash = "/" . $title;

aws_s3_link("--", "--", "--", $title_with_slash, 160000, 'us-east-1', array());
?>