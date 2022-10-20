<?php

$email = $_GET["email"];
$password = $_GET["password"];
$entityBody = '{"TableName": "autonotesone", "Key": {"users": {"S": "' . $email . '"}}}';


$return = array();


$aws_access_key_id = '--';
$aws_secret_access_key = '--';


$aws_region = 'us-east-1';
$host_name = "dynamodb.us-east-1.amazonaws.com"; //ou dynamodb.us-east-1.amazonaws.com


$content = $entityBody;


$aws_service_name = 'dynamodb';

// UTC timestamp and date
$timestamp = gmdate('Ymd\THis\Z');
$date = gmdate('Ymd');

// HTTP request headers as key & value
$request_headers = array();
$request_headers['Content-Type'] = "application/x-amz-json-1.0";
$request_headers['Date'] = $timestamp;
$request_headers['Host'] = $host_name;
$request_headers['x-amz-target'] = "--.GetItem";
ksort($request_headers);

// Canonical headers
$canonical_headers = [];
foreach($request_headers as $key => $value) {
	$canonical_headers[] = strtolower($key) . ":" . $value;
}
$canonical_headers = implode("\n", $canonical_headers);

// Signed headers
$signed_headers = [];
foreach($request_headers as $key => $value) {
	$signed_headers[] = strtolower($key);
}
$signed_headers = implode(";", $signed_headers);

// Cannonical request 
$canonical_request = [];
$canonical_request[] = "POST";
$canonical_request[] = "/";
$canonical_request[] = "";
$canonical_request[] = $canonical_headers;
$canonical_request[] = "";
$canonical_request[] = $signed_headers;
$canonical_request[] = hash('sha256', $content);
$canonical_request = implode("\n", $canonical_request);
$hashed_canonical_request = hash('sha256', $canonical_request);

// AWS Scope
$scope = [];
$scope[] = $date;
$scope[] = $aws_region;
$scope[] = $aws_service_name;
$scope[] = "aws4_request";

// String to sign
$string_to_sign = [];
$string_to_sign[] = "AWS4-HMAC-SHA256"; 
$string_to_sign[] = $timestamp; 
$string_to_sign[] = implode('/', $scope);
$string_to_sign[] = $hashed_canonical_request;
$string_to_sign = implode("\n", $string_to_sign);

// Signing key
$kSecret = 'AWS4' . $aws_secret_access_key;
$kDate = hash_hmac('sha256', $date, $kSecret, true);
$kRegion = hash_hmac('sha256', $aws_region, $kDate, true);
$kService = hash_hmac('sha256', $aws_service_name, $kRegion, true);
$kSigning = hash_hmac('sha256', 'aws4_request', $kService, true);

// Signature
$signature = hash_hmac('sha256', $string_to_sign, $kSigning);

// Authorization
$authorization = [
	'Credential=' . $aws_access_key_id . '/' . implode('/', $scope),
	'SignedHeaders=' . $signed_headers,
	'Signature=' . $signature
];
$authorization = 'AWS4-HMAC-SHA256' . ' ' . implode( ',', $authorization);

// Curl headers
$curl_headers = [ 'Authorization: ' . $authorization ];
foreach($request_headers as $key => $value) {
	$curl_headers[] = $key . ": " . $value;
}


$url = 'https://dynamodb.us-east-1.amazonaws.com/';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, $curl_headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $entityBody);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if($http_code != 200) {
	$return["headers"] = $curl_headers;

	$return["status"] = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	exit('Error : Failed to upload');
}
$return["status"] = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$tempData = html_entity_decode($response);
$cleanData = json_decode($tempData);

$encryptedPassword = $cleanData->Item->password->S;
$salt_string = $cleanData->Item->salt->S;
$salt = hex2bin($salt_string);
if ($encryptedPassword == sha1($password . $salt)) {
    $return["user"] = $cleanData;
    $return["status"] = "200";
}
else {
    $return["message"] = "Wrong password";
    $return["status"] = "400";
}
echo json_encode($return);

?>