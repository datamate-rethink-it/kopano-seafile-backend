<?php

namespace Files\Backend\Seafile;

require_once __DIR__ . "/../../files/php/Files/Backend/Webdav/sabredav/FilesWebDavClient.php";
require_once __DIR__ . "/../../files/php/Files/Backend/class.abstract_backend.php";
require_once __DIR__ . "/../../files/php/Files/Backend/class.exception.php";
require_once __DIR__ . "/../../files/php/Files/Backend/interface.quota.php";
require_once __DIR__ . "/../../files/php/Files/Backend/interface.version.php";
require_once __DIR__ . "/../../files/php/Files/Backend/interface.sharing.php";
require_once __DIR__ . "/lib/seafapi/class.seafapi.php";

use Files\Backend\AbstractBackend;
use Files\Backend\iFeatureQuota;
use Files\Backend\iFeatureVersionInfo;
use Files\Backend\iFeatureSharing;
use Files\Backend\Webdav\sabredav\FilesWebDavClient;
use Files\Backend\Exception as BackendException;
use SEAFAPI\Exception\ConnectionException;
use SEAFAPI\Exception\FileNotFoundException;
use SEAFAPI\seafapi;
use \Sabre\DAV\Exception as Exception;
use \Sabre\HTTP\ClientException;

/**
 * This is a file backend for seafile servers.
 * It requires the Webdav File Backend!
 *
 * @class   Backend
 * @extends AbstractBackend
 */
class Backend extends \Files\Backend\Webdav\Backend implements iFeatureSharing
{
	/**
	 * @var ocsclient The OCS Api client.
	 */
	var $seafapi;

	/**
	 * @constructor
	 */
	function __construct()
	{

		//$this->log('[datamate]: adsfafdasdfaf');

		// initialization
		$this->debug = PLUGIN_FILESBROWSER_LOGLEVEL === "DEBUG" ? true : false;

		$this->init_form();

		// set backend description
		$this->backendDescription = dgettext('plugin_filesbackendSeafile', "With this backend, you can connect to any webdav server (e.g. Seafile).");

		// set backend display name
		$this->backendDisplayName = "Seafile";

		// set backend version
		// TODO: this should be changed on every release
		$this->backendVersion = "1.0";
	}

	/**
	 * Initialise form fields
	 */
	private function init_form()
	{
		$this->formConfig = array(
			"labelAlign" => "left",
			"columnCount" => 1,
			"labelWidth" => 80,
			"defaults" => array(
				"width" => 292
			)
		);

		$this->formFields = array(
			array(
				"name" => "server_address",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Server address'),
				"editor" => array(
					"allowBlank" => false
				)
			),
			array(
				"name" => "server_port",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Server port'),
				"editor" => array(
					"ref" => "../../portField",
					"allowBlank" => false
				)
			),
			array(
				"name" => "server_ssl",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Use SSL'),
				"editor" => array(
					"xtype" => "checkbox",
					"listeners" => array(
						"check" => "Zarafa.plugins.files.data.Actions.onCheckSSL" // this javascript function will be called!
					)
				)
			),
			array(
				"name" => "server_path",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Webdav base path'),
				"editor" => array(
					"allowBlank" => false
				)
			),
			array(
				"name" => "user",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Username'),
				"editor" => array(
					"ref" => "../../usernameField"
				)
			),
			array(
				"name" => "password",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Password'),
				"editor" => array(
					"ref" => "../../passwordField",
					"inputType" => "password"
				)
			),
			array(
				"name" => "use_zarafa_credentials",
				"fieldLabel" => dgettext('plugin_filesbackendSeafile', 'Use Kopano credentials'),
				"editor" => array(
					"xtype" => "checkbox",
					"listeners" => array(
						"check" => "Zarafa.plugins.files.data.Actions.onCheckCredentials" // this javascript function will be called!
					)
				)
			),
		);

		$this->metaConfig = array(
			"success" => true,
			"metaData" => array(
				"fields" => $this->formFields,
				"formConfig" => $this->formConfig
			),
			"data" => array( // here we can specify the default values.
				"server_address" => "trial.seafile-demo.de",
				"server_port" => "80",
				"server_path" => "/seafdav"
			)
		);
	}

	/**
	 * Opens the connection to the webdav server.
	 *
	 * @throws BackendException if connection is not successful
	 * @return boolean true if action succeeded
	 */
	public function open()
	{

		// check if curl is available
		$serverHasCurl = function_exists('curl_version');
		if (!$serverHasCurl) {
			throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_NO_CURL), 500);
		}

		$davsettings = array(
			'baseUri' => $this->webdavUrl(),
			'userName' => $this->user,
			'password' => $this->pass,
			'authType' => \Sabre\DAV\Client::AUTH_BASIC,
		);

		try {
			$this->sabre_client = new FilesWebDavClient($davsettings);
			$this->sabre_client->addCurlSetting(CURLOPT_SSL_VERIFYPEER, !$this->allowselfsigned);

			$this->seafapi = new seafapi($this->getSeafileBaseURL(), $this->user, $this->pass);

			return true;
		} catch (\Exception $e) {
			$this->log('Failed to open: ' . $e->getMessage());
			if (intval($e->getHTTPCode()) == 401) {
				throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_UNAUTHORIZED), $e->getHTTPCode());
			} else {
				throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_UNREACHABLE), $e->getHTTPCode());
			}
		}
	}

	/**


	/**
	 * Copy a collection on webdav server
	 * Duplicates a collection on the webdav server (serverside).
	 * All work is done on the webdav server. If you set param overwrite as true,
	 * the target will be overwritten.
	 *
	 * @access private
	 *
	 * @param string $src_path Source path
	 * @param string $dst_path Destination path
	 * @param bool $overwrite Overwrite if collection exists in $dst_path
	 * @param bool $coll Set this to true if you want to copy a folder.
	 *
	 * @throws BackendException if request is not successful
	 *
	 * @return boolean true if action succeeded
	 */
	private function copy($src_path, $dst_path, $overwrite, $coll)
	{
		$time_start = microtime(true);
		$src_path = $this->removeSlash($src_path);
		$dst_path = $this->webdavUrl() . $this->removeSlash($dst_path);
		$this->log("[COPY] start for dir: $src_path -> $dst_path");
		if ($overwrite) {
			$overwrite = 'T';
		} else {
			$overwrite = 'F';
		}

		$settings = array("Destination" => $dst_path, 'Overwrite' => $overwrite);
		if ($coll) {
			$settings = array("Destination" => $dst_path, 'Depth' => 'Infinity');
		}

		try {
			$response = $this->sabre_client->request("COPY", $src_path, null, $settings);
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[COPY] done in $time seconds: " . $response['statusCode']);

			return true;
		} catch (ClientException $e) {
			throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
		} catch (Exception $e) {
			$this->log('[COPY] fatal: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
		}
	}

	/**
	 * This function will return a user friendly error string.
	 *
	 * @param number $error_code A error code
	 *
	 * @return string userfriendly error message
	 */
	private function parseErrorCodeToMessage($error_code)
	{
		$error = intval($error_code);

		$msg = dgettext('plugin_filesbackendSeafile', 'Unknown error');

		switch ($error) {
			case CURLE_BAD_PASSWORD_ENTERED:
			case self::WD_ERR_UNAUTHORIZED:
				$msg = dgettext('plugin_filesbackendSeafile', 'Unauthorized. Wrong username or password.');
				break;
			case CURLE_SSL_CONNECT_ERROR:
			case CURLE_COULDNT_RESOLVE_HOST:
			case CURLE_COULDNT_CONNECT:
			case CURLE_OPERATION_TIMEOUTED:
			case self::WD_ERR_UNREACHABLE:
				$msg = dgettext('plugin_filesbackendSeafile', 'File-server is not reachable. Wrong IP entered?');
				break;
			case self::WD_ERR_FORBIDDEN:
				$msg = dgettext('plugin_filesbackendSeafile', 'You don\'t have enough permissions for this operation.');
				break;
			case self::WD_ERR_NOTFOUND:
				$msg = dgettext('plugin_filesbackendSeafile', 'File is not available any more.');
				break;
			case self::WD_ERR_TIMEOUT:
				$msg = dgettext('plugin_filesbackendSeafile', 'Connection to server timed out. Retry later.');
				break;
			case self::WD_ERR_LOCKED:
				$msg = dgettext('plugin_filesbackendSeafile', 'This file is locked by another user.');
				break;
			case self::WD_ERR_FAILED_DEPENDENCY:
				$msg = dgettext('plugin_filesbackendSeafile', 'The request failed due to failure of a previous request.');
				break;
			case self::WD_ERR_INTERNAL:
				$msg = dgettext('plugin_filesbackendSeafile', 'File-server encountered a problem. Wrong IP entered?');
				break; // this comes most likely from a wrong ip
			case self::WD_ERR_TMP:
				$msg = dgettext('plugin_filesbackendSeafile', 'Could not write to temporary directory. Contact the server administrator.');
				break;
			case self::WD_ERR_FEATURES:
				$msg = dgettext('plugin_filesbackendSeafile', 'Could not retrieve list of server features. Contact the server administrator.');
				break;
			case self::WD_ERR_NO_CURL:
				$msg = dgettext('plugin_filesbackendSeafile', 'PHP-Curl is not available. Contact your system administrator.');
				break;
		}

		return $msg;
	}


	/**
	 * a simple php error_log wrapper.
	 *
	 * @access private
	 *
	 * @param string $err_string error message
	 *
	 * @return void
	 */
	private function log($err_string)
	{
		if ($this->debug) {
			error_log("[class.backend.php]: " . $err_string);
		}
	}

	/**
	 * Get the base URL of Seafile.
	 * For example: http://demo.seafile.com/seafile
	 *
	 * @return string
	 */
	public function getSeafileBaseURL()
	{

		$webdavurl = $this->webdavUrl();
		$baseurl = substr($webdavurl, 0, strlen($webdavurl) - strlen($this->metaConfig['data']['server_path']));
		$baseurl = rtrim($baseurl, "/");
		return $baseurl;
	}

	/**
	 * ============================ FEATURE FUNCTIONS ========================
	 */

	/**
	 * Return the version string of the server backend.
	 * @return String
	 */
	public function getServerVersion()
	{
		// check if curl is available
		$serverHasCurl = function_exists('curl_version');
		if (!$serverHasCurl) {
			throw new BackendException($this->parseErrorCodeToMessage(self::WD_ERR_NO_CURL), 500);
		}

		return $this->seafapi->getServerVersion();
	}



	/**
	 * Get all shares in the specified folder
	 *
	 * The response array will look like:
	 *
	 * array(
	 *  path1 => array(
	 *      id1 => details1,
	 *      id2 => details2
	 *  ),
	 *  path2 => array(
	 *      id1 => ....
	 *  )
	 * )
	 *
	 * @param $path
	 * @return array
	 */


																////////////// diese ist für die Navigation in der Ordnerstruktur da ////////////////


	public function getShares($path)
	{

		$this->log('[GETSHARES]: loading shares for folder: ' . $path);

		$lib_id = $this->seafapi->getLibraryFromPath($path);
		$path_w_lib = $this->seafapi->getPathWithoutLibrary($path);

		try {
			$shares = $this->seafapi->loadShares($path);
		} catch(ConnectionException $e) {
			$this->log('[GETSHARES]: connection exception while loading shares: ' . $e->getMessage() . " " . $e->getCode());

		}
		//$shares = $this->seafapi->getAllShares();

		$this->log('[GETSHARES]: found ' . count($shares) . ' shares for folder: ' . $path ."\n");

		$result[$path] = array();
		if ($shares !== false ) {
			foreach ($shares as $id => $options) {
				$result[$path][$id] = array(
					"shared" => true,
					"id" => $options->id,
					"path" => $path . ltrim(rtrim($options->path, '/'), '/'),
					"shareType" => 3,
					"permissions" => 3,
					"expiration" => $options->expire_date,
					"token" => $options->token,
					"url" => $options->link,
					"shareWith" => "",
					"shareWithDisplayname" => "",
					"password" => $options->password,
				);
				// $this->log($options->path);
				//$this->log("Share Nr. ". $id .": ". $path . ltrim(rtrim($options->path, '/'), '/'));
			}
		}
		return $result;
	}


/*
[1] => stdClass Object
        (
            [username] => christoph@dyllick-brenzinger.com
            [repo_id] => 1dee06b1-26ab-4937-b562-ae45eee47f46
            [ctime] => 2018-12-19T13:18:34+01:00
            [expire_date] => 
            [token] => 341a474806ba4ffeb36c
            [view_cnt] => 2
            [link] => https://seafile.privatecloud.de/f/341a474806ba4ffeb36c/
            [obj_name] => Beispiel für Herr Peter.xlsx
            [path] => /Beispiel für Herr Peter.xlsx
            [is_dir] => 
            [permissions] => stdClass Object
                (
                    [can_edit] => 
                    [can_download] => 1
                )

            [is_expired] => 
            [repo_name] => asdfasf
        )

*/




	/**
	 * Get details about the shared files/folders.
	 *
	 * The response array will look like:
	 *
	 * array(
	 *  path1 => array(
	 *      id1 => details1,
	 *      id2 => details2
	 *  ),
	 *  path2 => array(
	 *      id1 => ....
	 *  )
	 * )
	 *
	 * @param $patharray Simple array with path's to files or folders.
	 * @return array
	 */

						////////////// diese ist wenn ich auf teilen klicke !!! ////////////////
						///////////// haben wir jemals mehr als einen $path[0] wert?


	public function sharingDetails($patharray)
	{
		$result = array();

		//$this->log("hier sind wir");
		//$this->log($patharray[0]);
		//$this->log(implode("--", $patharray));
		//$this->log("---");

		// performance optimization
		// fetch all shares - so we only need one request
		/*if (count($patharray) > 1) {
			try {
				$shares = $this->seafapi->loadShares();
			} catch(ConnectionException $e) {
				$this->log('[SHARINGDETAILS]: connection exception while loading shares: ' . $e->getMessage() . " " . $e->getCode());
			}

			//$shares = $this->seafapi->getAllShares();

			foreach ($patharray as $path) {
				$result[$path] = array();
				foreach ($shares as $id => $details) {
					if ($details->path == $path) {
						$result[$path][$id] = array(
							"shared" => true,
							"id" => $details->id,
							"shareType" => 3,
							"permissions" => 1,
							"expiration" => "",
							"token" => $details->token,
							"url" => $details->link,
							"shareWith" => "",
							"shareWithDisplayname" => ""
						);
					}
				}
			}
		} else {*/
			// einen Pfad -> also hole Details   (WARUM???)
			if (count($patharray) == 1) {
				try {
					$shares = $this->seafapi->loadShareByPath($patharray[0]);
				} catch (FileNotFoundException $e) {
					$shares = false;
				}

				$this->log("Shares gefunden: ". count($shares));
				$result[$patharray[0]] = array();

				if ($shares !== false) {
					foreach ($shares as $id => $share) {

						// SHARE-TY
						if($share->shareType == 3){

							$result[$patharray[0]][$id] = array(
								"shared" => true,
								"id" => $share->id,
								"shareType" => $share->shareType,
								"permissions" => 1,
								"expiration" => $share->expire_date,
								"token" => $share->token,
								"url" => $share->link,
								"shareWith" => "",
								"shareWithDisplayname" => ""
							);

						}
					}
				}
			} else {
				return false; // $patharray was empty...
			}
		//}
		return $result;
	}
	

	/**
	 * Share one or multiple files.
	 * As the sharing dialog might differ for different backends, it is implemented as
	 * MetaForm - meaning that the argumentnames/count might differ.
	 * That's the cause why this function uses an array as parameter.
	 *
	 * $shareparams should look somehow like this:
	 *
	 * array(
	 *      "path1" => options1,
	 *      "path2" => options2
	 *
	 *      or
	 *
	 *      "id1" => options1 (ONLY if $update = true)
	 * )
	 *
	 * @param $shareparams
	 * @param bool $update
	 * @return bool
	 */
	public function share($shareparams, $update = false)
	{	
		if (count($shareparams > 0)) {

			/** @var string $path */
			foreach ($shareparams as $path => $options) {
				$path = rtrim($path, "/");
				
				if (!$update) {
					$share = $this->seafapi->createShare($path, $options);
					$result[$path] = array(
						"shared" => true,
						"id" => $share->id,
						"token" => $share->token,
						"url" => $share->link
					);
				} 
				/*else {
					foreach ($options as $key => $value) {
						$this->ocs_client->updateShare($path, $key, $value);
					}
					$result[$path] = array(
						"shared" => true,
						"id" => $path
					);
				}*/
			}
		} else {
			$this->log('No share params given');
			return false; // no shareparams...
		}

		return $result;
	}

	/**
	 * Disable sharing for the given files/folders.
	 *
	 *
	 * @param $idarray
	 * @return bool
	 * @throws \OCSAPI\Exception\ConnectionException
	 */
	public function unshare($idarray)
	{
		foreach ($idarray as $id) {
			$this->log("ID: ". $id);
			$this->seafapi->deleteShare($id);
		}
		return true;
	}

	/*
	 * Get Recipients that could be shared with, matching the search string
	 *
	 * @param $search Searchstring to use
	 * @return The response from the osc client API
	 */
	public function getRecipients($search) {

		// label = beliebiger Name
		// shareWith = user oder group id
		// shareType = user/group

		/*
		$arr = [];
		$arr[] = ['Max Mustermann', 1, user];
		$arr[] = ['Stephan Gunther', 2, user];
		return $arr;
		*/

		return $this->seafapi->getRecipients($search);

//		return $this->ocs_client->getRecipients($search);
	}



	// Hinweis zu den folgenden drei Funktionen:
	// Seafile handhabt die oberste Ebene = Libary anders. Deshalb müssen die Funktionen von https://stash.kopano.io/projects/KWA/repos/files/browse/php/Files/Backend/Webdav/class.backend.php überschrieben werden...


	public function mkcol($dir)
	{
		$time_start = microtime(true);
		$dir = $this->removeSlash($dir);

		// Zähle die "/". 
		// Wenn 1 => erzeuge eine Library
		// Wenn 2 => erzeuge ein Unterverzeichnis
		$i = substr_count($dir, "/");
		if($i > 1){
			
			// mkcol
			$this->log("[MKCOL] start for dir: $dir");
			try {
				$response = $this->sabre_client->request("MKCOL", $dir, null);
				$time_end = microtime(true);
				$time = $time_end - $time_start;
				$this->log("[MKCOL] done in $time seconds: " . $response['statusCode']);

				return true;
			} catch (ClientException $e) {
				throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
			} catch (Exception $e) {
				$this->log('[MKCOL] fatal: ' . $e->getMessage());
				throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
			}
		}

		else{

			// create seafile-library
			$dir = urldecode($dir);
			$this->log("[MKCOL] start for library: $dir");
			try {
				$this->seafapi->createLibrary($dir);
				$time_end = microtime(true);
				$time = $time_end - $time_start;
				$response['statusCode'] = 200;
				$this->log("[MKCOL] done in $time seconds: " . $response['statusCode']);
				return true;
			} catch (ClientException $e) {
				throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
			} catch (Exception $e) {
				$this->log('[MKCOL] fatal: ' . $e->getMessage());
				throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
			}

		}

	}


	public function delete($path)
	{
		$time_start = microtime(true);
		$path = $this->removeSlash($path);

		// Zähle die "/". Daran kann ich unterscheiden, ob es eine Bibliothek oder ein Ordner ist.
		$i = explode("/", $path);
		if(count($i) >= 1 AND $i[1] != ""){

			$this->log("[DELETE] start for dir: $path");
			try {
				$response = $this->sabre_client->request("DELETE", $path, null);
				$time_end = microtime(true);
				$time = $time_end - $time_start;
				$this->log("[DELETE] done in $time seconds: " . $response['statusCode']);

				return true;
			} catch (ClientException $e) {
				throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
			} catch (Exception $e) {
				$this->log('delete fatal: ' . $e->getMessage());
				throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
			}

		}

		else{

			// delete seafile-library
			$path = urldecode($path);
			$this->log("[DELETE] start for library: $path");
			try {
				$this->seafapi->deleteLibrary($path);

				$time_end = microtime(true);
				$time = $time_end - $time_start;
				$response['statusCode'] = 200;
				$this->log("[DELETE] done in $time seconds: " . $response['statusCode']);
				
				return true;
			} catch (ClientException $e) {
				throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
			} catch (Exception $e) {
				$this->log('delete fatal: ' . $e->getMessage());
				throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
			}
		}
	}

	public function move($src_path, $dst_path, $overwrite = false)
	{

		$time_start = microtime(true);
		$src_path = $this->removeSlash($src_path);

		// [MOVE] start for dir: asdfasf/test2 -> https://seafile.privatecloud.de:443/seafdav/asdfasf/test2a

		$i = substr_count($src_path, "/");
		if($i > 0){
			
			$dst_path = $this->webdavUrl() . $this->removeSlash($dst_path);
			$this->log("[MOVE] start for dir: $src_path -> $dst_path");
			if ($overwrite) {
				$overwrite = 'T';
			} else {
				$overwrite = 'F';
			}

			try {
				$response = $this->sabre_client->request("MOVE", $src_path, null, array("Destination" => $dst_path, 'Overwrite' => $overwrite));
				$time_end = microtime(true);
				$time = $time_end - $time_start;
				$this->log("[MOVE] done in $time seconds: " . $response['statusCode']);

				return true;
			} catch (ClientException $e) {
				throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
			} catch (Exception $e) {
				$this->log('move fatal: ' . $e->getMessage());
				throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
			}
		}

		// move a library
		else{
			$src_path = urldecode($src_path);
			$dst_path = $this->removeSlash($dst_path);
			$dst_path = urldecode($dst_path);
			$this->log("[MOVE] start for library: $src_path -> $dst_path");
			try {
				$this->seafapi->renameLibrary($src_path, $dst_path);
				return true;
			} catch (ClientException $e) {
				throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
			} catch (Exception $e) {
				$this->log('move fatal: ' . $e->getMessage());
				throw new BackendException($this->parseErrorCodeToMessage($e->getHTTPCode()), $e->getHTTPCode());
			}

		}
	}

	public function getQuotaBytesUsed($dir)
	{
		// Faktor 1.048576 weil /1000/1000*1024*1024.
		$return = $this->seafapi->checkAccountInfo();
		return $return->usage*1.048576;
		//} else {
		//	return -1;
	}

	public function getQuotaBytesAvailable($dir)
	{
		$return = $this->seafapi->checkAccountInfo();
		$avail = $return->total - $return->usage;
		if($return->total == -2)
			return -1;
		return $avail*1.048576;
	}

	public function ls($dir, $hidefirst = true)
	{

		$time_start = microtime(true);
		$dir = $this->removeSlash($dir);
		$lsdata = array();
		$this->log("[LS] start for dir: $dir");
		try {
			$response = $this->sabre_client->propFind($dir, array(
				'{DAV:}resourcetype',
				'{DAV:}getcontentlength',
				'{DAV:}getlastmodified',
				'{DAV:}getcontenttype',
				'{DAV:}quota-used-bytes',
				'{DAV:}quota-available-bytes',
			), 1);
			$this->log("[LS] backend fetched in: " . (microtime(true) - $time_start) . " seconds.");

			foreach ($response as $name => $fields) {

				if ($hidefirst) {
					$hidefirst = false; // skip the first line - its the requested dir itself
					continue;
				}

				$name = substr($name, strlen($this->path)); // skip the webdav path
				$name = urldecode($name);

				$type = $fields["{DAV:}resourcetype"]->resourceType;
				if (is_array($type) && !empty($type)) {
					$type = $type[0] == "{DAV:}collection" ? "collection" : "file";
				} else {
					$type = "file"; // fall back to file if detection fails... less harmful
				}

				$lsdata[$name] = array(
					"resourcetype" => $type,
					"getcontentlength" => isset($fields["{DAV:}getcontentlength"]) ? $fields["{DAV:}getcontentlength"] : null,
					"getlastmodified" => isset($fields["{DAV:}getlastmodified"]) ? $fields["{DAV:}getlastmodified"] : null,
					"getcontenttype" => isset($fields["{DAV:}getcontenttype"]) ? $fields["{DAV:}getcontenttype"] : null,
					"quota-used-bytes" => isset($fields["{DAV:}quota-used-bytes"]) ? $fields["{DAV:}quota-used-bytes"] : null,
					"quota-available-bytes" => isset($fields["{DAV:}quota-available-bytes"]) ? $fields["{DAV:}quota-available-bytes"] : null,
				);
			}
			$time_end = microtime(true);
			$time = $time_end - $time_start;
			$this->log("[LS] done in $time seconds");


			// Anreichern von letztem Änderungsdatum von Ordnern (nicht bibliotheken)
			$dir = "/". urldecode($dir);
			$lib_id = $this->seafapi->getLibraryFromPath($dir);
			$path_w_lib = $this->seafapi->getPathWithoutLibrary($dir);

			// wir sind in einem unterverzeichnis
			if(!empty($lib_id['id'])){
				//$this->log("[lib_id]: ". $lib_id['id']);
				//$this->log("[lib_w_lib]: ". $path_w_lib);
				$d=$this->seafapi->listDirectoryEntries($lib_id['id'], $path_w_lib);

				for($i = 0; $i < count($d); $i++){
					if($d[$i]->type == "dir")
						$lsdata[$dir."".$d[$i]->name ."/"]['getlastmodified'] = date('r', $d[$i]->mtime);
				}
			}
			// wir sind auf der obersten Ebene... hole die Gesamtgröße und mtime-Zeitstempel für die Bibliotheken...
			else{
				$l=$this->seafapi->listLibraries();
				for($i = 0; $i < count($l); $i++){
					$lsdata["/".$l[$i]->name ."/"]['getlastmodified'] = date('r', $l[$i]->mtime);
					// $lsdata["/".$l[$i]->name ."/"]['getcontentlength'] = $l[$i]->size;	 // zeigt Kopano sowieso nicht an...
				}
			}

			return $lsdata;

		} catch (ClientException $e) {
			$this->log('ls sabre error: ' . $e->getMessage());
			throw new BackendException($this->parseErrorCodeToMessage($e->getCode()), $e->getCode());
		} catch (Exception $e) {
			$this->log('ls fatal: ' . $e->getMessage() . " [" . $e->getHTTPCode() .  "]");
			// THIS IS A FIX FOR OWNCLOUD - It does return 500 instead of 401...
			$err_code = $e->getHTTPCode();
			// check if code is 500 - then we should try to parse the error message
			if($err_code === 500) {
				// message example: HTTP-Code: 401
				$regx = '/[0-9]{3}/';
				if(preg_match($regx, $e->getMessage(), $found)) {
					$err_code = $found[0];
				}
			}
			throw new BackendException($this->parseErrorCodeToMessage($err_code), $err_code);
		}
	}


	/* So sieht ein Rückgabewert aus:
	$lsdata['/Libary-Name/Foto.png'] = array(
		'getlastmodified' => 'Fri, 15 Mar 2019 23:45:33 GMT',
		'getcontentlength' => '634880',
		'getcontenttype' => 'image/png'
	);
	*/

	// übernommen aus https://stash.kopano.io/projects/KWA/repos/files/browse/php/Files/Backend/Webdav/class.backend.php
	/**
	 * Removes the leading slash from the folder path
	 *
	 * @access private
	 *
	 * @param string $dir directory path
	 *
	 * @return string trimmed directory path
	 */
	public function removeSlash($dir)
	{
		if (strpos($dir, '/') === 0) {
			$dir = substr($dir, 1);
		}

		// remove all html entities and urlencode the path...
		$nohtml = html_entity_decode($dir);
		$dir = implode("/", array_map("rawurlencode", explode("/", $nohtml)));

		return $dir;
	}

}

?>
