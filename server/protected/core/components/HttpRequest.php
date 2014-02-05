<?php

class HttpRequest extends Component {

	protected $_restParams = null;

	public function getRoute() {
		return str_replace("{$_SERVER['SCRIPT_NAME']}/", '', $_SERVER['REQUEST_URI']);
	}

	public function isAjaxRequest() {
		return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest';
	}

	public function isJSON() {
		return isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false;
	}

	public function isRequestType($type) {
		return (isset($_SERVER['REQUEST_METHOD']) && !strcasecmp($type, $_SERVER['REQUEST_METHOD']))
			|| (isset($_POST['_method']) && !strcasecmp($type, $_POST['_method']));
	}

	public function getRestParams() {
		if ($this->_restParams === null) {
			$result = array();
			if (function_exists('mb_parse_str')) {
				mb_parse_str($this->getRawBody(), $result);
			} else {
				parse_str($this->getRawBody(), $result);
			}
			$this->_restParams = $result;
		}

		return $this->_restParams;
	}

	public function getRawBody() {
		static $rawBody;
		if ($rawBody === null) {
			$rawBody = file_get_contents('php://input');
		}
		return $rawBody;
	}

} 