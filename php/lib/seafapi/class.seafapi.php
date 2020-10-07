<?php
namespace SEAFAPI;

//require_once __DIR__ . "/class.seafshare.php";
require_once __DIR__ . "/Exception/class.ConnectionException.php";
require_once __DIR__ . "/Exception/class.FileNotFoundException.php";
require_once __DIR__ . "/Exception/class.InvalidArgumentException.php";
require_once __DIR__ . "/Exception/class.PermissionDeniedException.php";
require_once __DIR__ . "/Exception/class.InvalidResponseException.php";
require_once __DIR__ . "/Exception/class.InvalidRequestException.php";
#require_once __DIR__ . "/class.seafapi.php";
//require_once __DIR__ . "/class.ocsshare.php";

use SEAFAPI\Exception\ConnectionException;
use SEAFAPI\Exception\InvalidRequestException;
use SEAFAPI\Exception\InvalidResponseException;
use SEAFAPI\Exception\FileNotFoundException;
use SEAFAPI\Exception\InvalidArgumentException;
use SEAFAPI\Exception\PermissionDeniedException;

/**
 * This class provides basic functionality to interact with the seafile api.
 * For mor details read here: https://manual.seafile.com/develop/web_api_v2.1.html
 *
 *
 * @class   seafapi
 */
class seafapi {

	/**
	 * Seafile API
	 */

	/**
	 * @var string Server base URL
	 */
	private $baseurl = "";

	/* @var string Username */
	private $user = "";

	/**
	 * @var string Password
	 */
	private $pass = "";

	/**
	 * @var bool Defines if the store has been loaded
	 */
	private $loaded = false;


	private $token = "";
	private $seafile_status_message = array(
		'200'	=>	'OK',
		'201'	=>	'CREATED',
		'202'	=>	'ACCEPTED',
		'301'	=>	'MOVED_PERMANENTLY',
		'400'	=>	'BAD_REQUEST',
		'403'	=>	'FORBIDDEN',
		'404'	=>	'NOT_FOUND',
		'409'	=>	'CONFLICT',
		'429'	=>	'TOO_MANY_REQUESTS',
		'440'	=>	'REPO_PASSWD_REQUIRED',
		'441'	=>	'REPO_PASSWD_MAGIC_REQUIRED',
		'500'	=>	'INTERNAL_SERVER_ERROR',
		'520'	=>	'OPERATION_FAILED'
	);
	private $seafile_code;
	private $seafile_status;
	private $http_options = array();
	private $response_object;
	public $response_object_to_array = false;
	public $response_info;

	/**
	 * @var share[] This will hold an array of ocsshares - index is the share ID.
	 */
	private $shares;


	/**
	 * Constructor.
	 *
	 * @param $baseurl
	 * @param $user
	 * @param $pass
	 * @throws ConnectionException
	 */
	function __construct($baseurl, $user, $pass) {
		// check if curl is available
		$serverHasCurl = function_exists('curl_version');
		if (!$serverHasCurl) {
			throw new ConnectionException("Curl not found!");
		}

		$this->baseurl = $baseurl;
		$this->user = $user;
		$this->pass = $pass;
		$this->shares = array();
		$this->sharesByPath = array();

		// default curl config
		$this->http_options[CURLOPT_AUTOREFERER] = true;
		$this->http_options[CURLOPT_TIMEOUT] = 10;
		$this->http_options[CURLOPT_RETURNTRANSFER] = true;
		$this->http_options[CURLOPT_FOLLOWLOCATION] = false;
		$this->http_options[CURLOPT_SSL_VERIFYHOST] = false;
		$this->http_options[CURLOPT_SSL_VERIFYPEER] = false;

		// get the token
		$this->getToken();

		//echo $this->getToken();

	}

	public function decode($data){
		if(!$this->response_object_to_array)
			return json_decode($data);
		else
			return json_decode($data, true);
	}

	private function http_parse_message($res) {

		if(! $res)
			throw new ConnectionException(curl_error($this->handle), -1);

		$this->response_info = curl_getinfo($this->handle);
		$code = $this->response_info['http_code'];

		$this->seafile_code = $code;
		$this->seafile_status = $this->seafile_status_message[$code];

		if($code == 404){
			// this ConnectionException is disabled because of a bug in the files-plugin. In case of the deletion of a library the files plugin tries to delete it twice.
			// see https://jira.kopano.io/browse/KFP-398
			// temporary solution: don't throw Exception but return a false.

			//throw new ConnectionException($this->seafile_code. ' - '.$this->seafile_status . ' - ' .curl_error($this->handle));
			return false;
		}

		if($code >= 400 && $code <=600)
			throw new ConnectionException($this->seafile_code. ' - '.$this->seafile_status . ' - ' .'Server response status was: ' . $code . ' with response: [' . $res . ']', $code);

		if(!in_array($code, range(200,207)))
			throw new ConnectionException($this->seafile_code. ' - '.$this->seafile_status . ' - ' .'Server response status was: ' . $code . ' with response: [' . $res . ']', $code);
	}

	private function log($err_string)
	{
			error_log("[class.seafapi.php]: " . $err_string);
	}

	public function ping(){
		return $this->decode($this->get($this->baseurl.'/api2/ping/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	public function getLibraryFromPath($path){

		// return value
		$lib = array('id' => '', 'name' => '');

		$path_array = explode("/", $path);
		$mylibraries = $this->listLibraries();

		$path_w_lib = str_replace("/".$path_array[1], "", $path);

		foreach($mylibraries as $l){
		    if($l->name == $path_array[1]){
		        $lib['id'] = $l->id;
		    	$lib['name'] = $l->name;
		    }
		}

		return $lib;

	}

	public function getLibraryByName($name){

		$mylibraries = $this->listLibraries();
		$name = str_replace("/", "", $name);

		foreach($mylibraries as $l){
		    if($l->name == $name){
		        return $l->id;
		    }
		}

	}

	public function getPathWithoutLibrary($path){
		if($path == "/")
			return "/";
		else{
			$path_array = explode("/", $path);
			$path_w_lib = str_replace("/".$path_array[1], "", $path);
			return $path_w_lib;
		}
	}






	private function getToken(){
		$data = $this->decode($this->post($this->baseurl.'/api2/auth-token/', array(
			'username' => $this->user,
			'password' => $this->pass
		)));
		$this->token = (string)$data->token;
	}

	private function post($url, $fields = array(), $http_options = array()) {

/*		if(is_array($fields)){
			$http_options[CURLOPT_HTTPHEADER] = array(
				'Content-Type: multipart/form-data',
				'Authorization: Token '.$this->token
			);
		}
*/

		$http_options = $http_options + $this->http_options;
		$http_options[CURLOPT_POST] = true;
		$http_options[CURLOPT_POSTFIELDS] = $fields;
		$this->handle = curl_init($url);

		if(! curl_setopt_array($this->handle, $http_options))
			throw new Exception("Error setting cURL request options.");

		$this->response_object = curl_exec($this->handle);
		$this->http_parse_message($this->response_object);

		curl_close($this->handle);
		return $this->response_object;
	}

	private function get($url, $http_options = array()) {

		$http_options = $http_options + $this->http_options;
		$this->handle = curl_init($url);

		if(! curl_setopt_array($this->handle, $http_options))
			throw new Exception("Error setting cURL request options");


		$this->response_object = curl_exec($this->handle);
		$this->http_parse_message($this->response_object);

		curl_close($this->handle);
		return $this->response_object;
	}

	public function put($url, $data = '', $http_options = array()) {

		$http_options = $http_options + $this->http_options;
		$http_options[CURLOPT_CUSTOMREQUEST] = 'PUT';
		$http_options[CURLOPT_POSTFIELDS] = $data;
		$this->handle = curl_init($url);

		if(! curl_setopt_array($this->handle, $http_options))
			throw new Exception("Error setting cURL request options.");

		$this->response_object = curl_exec($this->handle);
		$this->http_parse_message($this->response_object);

		curl_close($this->handle);
		return $this->response_object;
	}

	public function delete($url, $http_options = array()) {

		$http_options = $http_options + $this->http_options;
		$http_options[CURLOPT_CUSTOMREQUEST] = 'DELETE';
		$this->handle = curl_init($url);

		if(! curl_setopt_array($this->handle, $http_options))
			throw new Exception("Error setting cURL request options.");

		$this->response_object = curl_exec($this->handle);
		$this->http_parse_message($this->response_object);

		curl_close($this->handle);
		return $this->response_object;
	}

	public function getServerInformation(){
		return $this->decode($this->get($this->baseurl.'/api2/server-info/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	public function getServerVersion(){
		$arr = $this->getServerInformation();
		if (in_array("seafile-pro", $arr->features))
			return $arr->version ." (Professional)";
		else
			return $arr->version ." (Community)";
	}

	public function checkAccountInfo(){
		return $this->decode($this->get($this->baseurl.'/api2/account/info/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}


	public function listAllShareLinks(){
		return $this->decode($this->get($this->baseurl.'/api/v2.1/share-links/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	public function createShareLink($library_id, $path, $password = "", $expire_days = ""){

		//error_log("[datamate]: ". $library_id ." - ". $path ." - ");

		$data = array(
			'path' 	=> $path,
			'repo_id' => $library_id
		);
		if($data['path'] == "" OR !isset($data['path']))
			$data['path'] = "/";
		if($password != "")
			$data['password'] = $password;
		if($expire_days != "")
			$data['expire_days'] = $expire_days;

		$return = $this->decode($this->post($this->baseurl.'/api/v2.1/share-links/', $data,
			array(
				CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
			)
		));

		$c = count($this->shares);
		$return->id = $c;
		$this->shares[$c] = $return;
		return $return;
	}

	public function listLibraries(){
		return $this->decode($this->get($this->baseurl.'/api2/repos/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	// List Share Links of a Library
	// GET https://cloud.seafile.com/api/v2.1/share-links/?repo_id={repo_id}
	public function listShareLinksOfALibrary($library_id){
		return $this->decode($this->get($this->baseurl.'/api/v2.1/share-links/?repo_id='. $library_id, array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	// List Shared Folders
	// GET https://cloud.seafile.com/api/v2.1/shared-folders/
	public function listSharedFolders(){
		return $this->decode($this->get($this->baseurl.'/api/v2.1/shared-folders/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	// Check Password
	public function checkPassword($file_token){
		try {
			$this->decode($this->post($this->baseurl.'/api/v2.1/admin/share-links/'. $file_token.'/check-password/', array(
				'password' => 999999
			),
			array(
				CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
			)));
		}
		catch(Exception $e) {
			return (int)$e->getMessage();
		}
	}


	// List Share Links of a Folder
	// GET https://cloud.seafile.com/api/v2.1/share-links/?repo_id={repo_id}&path={path}
	//public function listShareLinksOfAFolder($library_id, $path){
	//	error_log($this->baseurl.'/api/v2.1/share-links/?repo_id='. $library_id.'&path='. $path);
	//	return $this->decode($this->get($this->baseurl.'/api/v2.1/share-links/?repo_id='. $library_id.'&path='. $path, array(
	//		CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
	//	)));
	//}


	// Delete Share Link
	// DELETE https://cloud.seafile.com/api/v2.1/share-links/{token}/
	public function deleteShareLink($token){
		return $this->decode($this->delete($this->baseurl.'/api/v2.1/share-links/'.$token.'/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	// Search User
	// GET https://cloud.seafile.com/api2/search-user/?q=foo
	public function searchUser($q){
		return $this->decode($this->get($this->baseurl.'/api2/search-user/?q='. $q, array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}


	// Share A Folder
	// PUT https://cloud.seafile.com/api2/repos/{repo-id}/dir/shared_items/?p={path}
	// if path = "", dann ist es library share
	public function shareAFolderToUser($library_id, $user, $path, $permission = "r"){
		//error_log($this->baseurl.'/api2/repos/'.$library_id.'/dir/shared_items/?p='. $path);
		return $this->decode($this->put($this->baseurl.'/api2/repos/'.$library_id.'/dir/shared_items/?p='. $path .'/', array(
				'share_type' 		=> 'user',
				'username' 			=> $user,
				'permission' 		=> $permission
			),
			array(
				CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
			)
		));
	}


	/**
Kann die nicht weg??
	 * Get the base URL for Seafile API.
	 *
	 * @return string
	 */
	//private function getAPIUrl() {
	//	return $this->baseurl . self::_PATH . "/shares";
	//}

	/**
	 * Shortcut for curl get requests
	 * @param $url string URL for the request
	 * @return curl response data
	 */
/*
	private function doCurlGetRequest($url) {
		return $this->doCurlRequest($url, array());
	}
*/

	/**
	 * Execute curl request with paramters
	 *
	 * @param $url string URL for the request
	 * @return curl responsedata
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */
/*
	private function doCurlRequest($url, $curlOptions) {
		$ch = curl_init();

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt_array($ch, $this->curlDefaultOptions);
		curl_setopt($ch, CURLOPT_USERPWD, $this->user . ":" . $this->pass);
		if (!empty($curlOptions)) {
			curl_setopt_array($ch, $curlOptions);
		}

		$responsedata = curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

		if($httpcode == 0) {
			$message = curl_errno($ch);
		} else {
			$message = $httpcode;
		}
		curl_close($ch);

		if ($httpcode && $httpcode == "200") {
			$this->loaded = true;
			return $responsedata;
		}
		$this->loaded = false;
		if ($httpcode == "0") {
			throw new ConnectionException($message, $httpcode);
		} else {
			throw new ConnectionException($httpcode);
		}
	}
*/

	/**
	 * Loads the shares for a specific folder.
	 * If $path is empty all shares will loaded.
	 *
	 * @param string $path
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */

	public function loadShares($path = "/") {

		// Erklärung von Christoph Dyllick-Brenzinger (datamate):
		// Kopano arbeitet mit absoluten Pfaden. Also z.B. /Kunden/BASF/Zugangsdaten.txt
		// Seafile arbeitet auf der obersten Ebene mit Library-IDs. Z.B. Könnte Kunden = 98d9fe5e-c33e-480c-8619-73545c0a9e31 sein.
		// deshalb muss ich das umformen und es gibt 3 Fälle:
		// a) Path = /, d.h. hole alles
		// b) Path = /Kunden/, d.h. man will nur einen Teil der Shares zurückhaben. Gleichzeitig muss die Ausgabe umformatiert werden.

		// reset all loaded shares first
		$this->reset();

		$lib = $this->getLibraryFromPath($path);
		$path_w_lib = $this->getPathWithoutLibrary($path);

// SHARE-LINKS AND FOLDERS

		// get all shares of a library
		$shares = $this->listShareLinksOfALibrary($lib['id']);

		// Kopano expects an id value
		for($i = 0; $i < count($shares); $i++){
			$shares[$i]->id = $i;
			$shares[$i]->shareType = 3;
			//$shares[$i]->path = "/". $shares[$i]->obj_name;

			// check if password is set
			// kann den Fehlercode nicht richtig abfangen...
			// ... $this->checkPassword($shares[$i]->token) ...

		}




		// wir sind irgendwo tiefer im Baum -> ich will nur die, die
		// a) die richtige REPO haben und
		// b) in $details->path, den $path am Anfang haben...
		// ausserdem muss ich den pfad umbauen. In path darf nur / + Dateiname stehen... Alle davorstehenden Ordner müssen weg...
		if(substr_count($path, "/") >= 2){
			$shares_new = array();

			$i = 0;
			foreach ($shares as $id => $details) {

				if($details->repo_name == $lib['name']){
					if (strpos($details->path, $path_w_lib) === 0) {
	   					$shares_new[$id] = $shares[$id];
	   					// path should only contain "/" + filename.
	   					$shares_new[$id]->path = "/". $details->obj_name;
	   					$i++;
	   				}
				}
			}
			$shares = $shares_new;
		}

// SHARED-FOLDERS

		/*
		$i = count($shares);
		$folders = $this->listSharedFolders();
		foreach ($folders as $id => $details){
			$shares[$i] = $folders[$id];
			$shares[$i]->id = $i;
			$shares[$i]->shareType = 0;
			$i++;
		}
		*/

// RETURN

		$this->shares = $shares;
		$this->loaded = true;
		return $shares;
	}

	/*
	function listSharedFolders(){
		$output = $this->listSharedFolders();
		return $output;
	}
	*/



	/**
	 * Loads only one specific share defined by ID.
	 *
	 * @param $id
	 * @return ocsshare or FALSE
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */

	public function loadShareByID($id) {
		// GEHT !!!

		$this->loadShares();
		//$this->loaded = true;
		if(isset($this->shares[$id])) {
			return $this->shares[$id];
		} else {
			return false;
		}

	}


	/**
	 * Loads one or more shares defined by path.
	 *
	 * @param $path
	 * @return ocsshare[] or FALSE
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */


	public function loadShareByPath($path) {


		// das geht noch nicht !!!

		//echo "\n Das ist der Pfad initial in loadShareByPath ". $path ."\n";

		//$this->loaded = true;
		$shares = $this->loadShares($path);
		return $shares;

		/*
		// reset all loaded shares first
		$this->reset();

		$path = rtrim($path, "/");

		$lib_id = $this->getLibraryFromPath($path);
		$path_w_lib = $this->getPathWithoutLibrary($path);
		$shares = $this->listShareLinksOfALibrary($lib_id);

		error_log("## #aadsfaf ". $path);
		error_log("--->". implode("-", $this->shares));
		error_log("a-adf-a-df");


		//$url = $this->getOCSUrl() . "?path=" . urlencode($path);
		//$this->parseListingResponse($this->doCurlGetRequest($url));
		$this->loaded = true;
		foreach ($this->shares as $id => $details) {
			if($details->path == $path) {
				$shares[$id] = $details;
			}
		}
		if(count($shares) > 0) {
			return $shares;
		} else {
			return false;
		}*/
	}


	/**
	 * Gets all groups and users we can share with.
	 *
	 * @return [] or FALSE
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */

	public function getRecipients($search) {
		$output = array();
		$res = $this->searchUser($search);

		//print_r($res);
		//echo "---";
		if(count($res->users) == 0){
			return $output;
		}
		else{
			foreach($res->users as $i => $u){
				$output[] = [$u->name." (".$u->email.")", $u->email, 'user'];
			}
		}
		return $output;

/*[
    {'avatar_url': 'https://cloud.seafile.com/media/avatars/default.png',
      'contact_email': u'foo@foo.com',
      'email': u'foo@foo.com',
      'name': 'foo'},
    {'avatar_url': 'https://cloud.seafile.com/media/avatars/default.png',
     'contact_email': u'foo-bar@foo-bar.com',
     'email': u'foo-bar@foo-bar.com',
     'name': 'foo-bar'}
]


		$output[] = ['Max Mustermann', 1, user];
		$output[] = ['Wilma Wunder', 2, user];
		*/

	}
/*
	public function getRecipients($search) {
		$url = $this->baseurl . self::OCS_PATH . "/sharees?itemType=file&search=" . urlencode($search) ;

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt_array($ch, $this->curlDefaultOptions);
		curl_setopt($ch, CURLOPT_USERPWD, $this->user . ":" . $this->pass);
		$responsedata = curl_exec($ch);
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		if ($httpcode === 200) {
			try {
				$xmldata = new \SimpleXMLElement($responsedata);
			} catch (\Exception $e) {
				throw new InvalidResponseException($responsedata);
			}

			if(!$xmldata || !isset($xmldata->meta) || !$this->parseResponseMeta($xmldata->meta) || !isset($xmldata->data)) {
				return false;
			}

			return $this->parseRecipientData($xmldata->data);
		} else {
			throw new ConnectionException($httpcode);
		}
	}
*/

	/**
	 * Get all loaded shares. Will return FALSE if the store is not loaded yet.
	 *
	 * @return ocsshare or FALSE
	 */

	/*
	public function getAllShares() {

		if(!$this->loaded) {
			return FALSE;
		}

		return $this->shares;
	}
	*/



	/**
	 * Returns one ocsshare specified by ID. Or FALSE if the ID was not found or store is not loaded yet.
	 *
	 * @param $id
	 * @return ocsshare or bool
	 */
	/*
	public function getShareByID($id) {
		if(!$this->loaded) {
			return FALSE;
		}

		if(isset($this->shares[$id])) {
			return $this->shares[$id];
		} else {
			return FALSE;
		}
	}
	*/


	/**
	 * Returns one or many ocsshare specified by Path. Or FALSE if path was not found or store is not loaded yet.
	 *
	 * @param $path
	 * @return ocsshare[] or bool
	 */
	/*
	public function getShareByPath($path) {


		echo $path;
		$shares = $this->loadShareByPath($path);

		// $path ist der volle Pfad: also Library + Dateiname...

		if(!$this->loaded) {
			return FALSE;
		}

		foreach ($this->shares as $id => $details) {
			if("/". $details->repo_name ."/". $details->path == $path) {
				$shares = $details;
			}
		}

		if(count($shares) > 0) {
			return $shares;
		} else {
			return FALSE;
		}
	}
	*/

	/**
	 * Create a new share on the server.
	 * Optionnames in $options should match Owncloud option names.
	 * See: https://doc.owncloud.org/server/8.0/developer_manual/core/ocs-share-api.html
	 *
	 * Options has to include shareType (int),  ‘0’ = user; ‘1’ = group; ‘3’ = public link;
	 * and shareWith for shareType 0 or 1.
	 *
	 * @param $path
	 * @param $options
	 * @return ocsshare
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */


	public function createShare($path = "/", $options) {

		// INPUT:
		// $path: "/asdfasf/logo-neu.png"
		// $options: "array(shareType = 3)"
		// Challenge: how to get repository from path
		// search $path_array[1] in $mylibraries
		// huge problem if folder exists twice				=> PROBLEM !!!!

		$lib = $this->getLibraryFromPath($path);
		$path_w_lib = $this->getPathWithoutLibrary($path);

		/* mögliche Werte:
		$options(
			'shareType' = int,
				z.B. "3" => share-link
					'password' = string, z.B. "geheim"
					'expireDate' = string, z.B. "2019-03-30"
				z.B. "0" => user
				z.B. "1" => group
		*/



		if($options['shareType'] == 3){

			$password = "";
			if($options['password'] != "")
				$password = $options['password'];

			$expire_days = "";
			if($options['expireDate'] != ""){

				//error_log("time: ". time());
				//error_log("strtotime: ". strtotime($options['expireDate']));

				$datediff = strtotime($options['expireDate']) - time();
				$expire_days = ceil($datediff / (60 * 60 * 24));
			}

			return $this->createShareLink($lib['id'], $path_w_lib, $password, $expire_days);

		}

		if($options['shareType'] == 0){
			return $this->shareAFolderToUser($lib['id'], 'rdb@datamate.org', $path_w_lib, $permission = "r");

			// ($library_id, $user, $path, $permission = "r"){


		}

		else
			return false;
	}


	/**
	 * Update one value of the given share. ATTENTION: updating the password will change the share id.
	 *
	 * @param $id
	 * @param $key
	 * @param $value
	 * @return ocsshare Returns a empty share
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */

	// Brauche ich nicht mehr !!!

/*
	public function updateShare($id, $key, $value) {
		$url = $this->getOCSUrl() . "/" . $id;

		// post variables
		$fields_string = $key.'='.urlencode($value);
		$curlExtraOptions = array(
			CURLOPT_CUSTOMREQUEST => "PUT",
			CURLOPT_POSTFIELDS => $fields_string
		);
		return $this->parseModificationResponse($this->doCurlRequest($url, $curlExtraOptions));
	}
*/

	/**
	 * Clear all loaded shares.
	 */
	public function reset() {
		unset($this->sharesByPath);
		$this->sharesByPath = array();

		unset($this->shares);
		$this->shares = array();
	}

	/**
	 * Delete the given share.
	 *
	 * @param $id
	 * @return ocsshare Returns a empty share
	 * @throws ConnectionException
	 * @throws InvalidResponseException
	 */

	public function deleteShare($id) {

		//error_log("JETZT KOMMT DER LINK WIEDER WEG!");
		//error_log($id);

		$share = $this->loadShareByID($id);
		if($share->id == $id){

			//$token = $this->loadShareByID($id)->token;
			//error_log($token);
			return $this->deleteShareLink($share->token);
		}

		return false;

		//$url = $this->getOCSUrl() . "/" . $id;
		//$curlExtraOptions = array(
		//	CURLOPT_CUSTOMREQUEST => "DELETE",
		//);
		//return $this->parseModificationResponse($this->doCurlRequest($url, $curlExtraOptions));
	}


	public function createLibrary($name, $desc = "", $passwd = ""){

		// $name comes with "/" at the end... (e.g. NewFolder/)
		$data = array(
			'name' 	=> str_replace("/", "", $name)
		);
		return $this->decode($this->post($this->baseurl.'/api2/repos/', $data,
			array(
				CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
			)
		));
	}

	public function deleteLibrary($name){

		//$this->log($path);

		// get library_id from path:
		$lib = $this->getLibraryByName($name);
		//$this->log($lib);


		return $this->decode($this->delete($this->baseurl.'/api2/repos/'.$lib.'/', array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}

	public function renameLibrary($name, $library_new_name){

		$lib = $this->getLibraryByName($name);
		$data = array(
			'repo_name' => $library_new_name
		);
		return $this->decode($this->post($this->baseurl.'/api2/repos/'.$lib.'/?op=rename', $data,
			array(
				CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
			)
		));
	}

	public function listDirectoryEntries($lib, $path = ""){

		//$lib = $this->getLibraryByName($name);
		if($path != ""){
			$path = "?p=". $path;
		}

		return $this->decode($this->get($this->baseurl.'/api2/repos/'.$lib.'/dir/'.urlencode($path), array(
			CURLOPT_HTTPHEADER => array('Authorization: Token '.$this->token)
		)));
	}


}

