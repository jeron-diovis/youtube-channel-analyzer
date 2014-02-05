<?php

// it's just to display correct error messages for ajax requests
class ErrorHandler extends Component {

	public function __construct(array $config = array()) {
		parent::__construct($config);

		$errorCallback = array(
			$this,
			'handleError'
		);
		set_error_handler($errorCallback, E_ALL);

		$exceptionCallback = array(
			$this,
			'handleException'
		);
		set_exception_handler($exceptionCallback);
	}

	public function handleException(Exception $exception) {
		header("HTTP/1.0 {$exception->getCode()}");

		if ($this->isAjaxRequest()) {
			echo $exception->getMessage();
		} else {
			echo '<h1>'.get_class($exception)."</h1>\n";
			echo '<p>'.$exception->getMessage().' ('.$exception->getFile().':'.$exception->getLine().')</p>';
			echo '<pre>'.$exception->getTraceAsString().'</pre>';
		}

	}

	public function handleError($errorNumber, $errorMessage, $errorFileName, $errorLine) {
		$errorReporting = error_reporting();
		if ( $errorReporting == 0 || ($errorNumber & $errorReporting) != $errorNumber ) {
			return;
		}

		$errorData = array(
			'type'=> 'ERROR',
			'code' => $errorNumber,
			'message' => $errorMessage,
			'file' => $errorFileName,
			'line' => $errorLine,
		);

		if ($this->isAjaxRequest()) {
			echo $errorData['message'];
		} else {
			return null;// resume default php handler
		}
	}

	protected function isAjaxRequest() {
		return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH']==='XMLHttpRequest';
	}
}
