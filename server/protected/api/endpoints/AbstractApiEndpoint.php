<?php

abstract class AbstractApiEndpoint extends Component {

	public function run() {
		$this->ensureValidRequest();

		$data = $this->getRawModelData();
		if (empty($data)) {
			return false;
		}
		$data = $this->parse($data);
		list($sql, $params) = $this->composeQuery($data);

		$db = $this->getApp()->db;
		$db->connect();
		$result = $db->execute($sql, $params) > 0;

		if ($result) {
			$response = 'done';
		} else {
			$response = 'fail';
		}
		if ($this->getApp()->request->isAjaxRequest()) {
			$response = $this->encode($response);
		}
		echo $response;
		return $result;
	}

	private function ensureValidRequest() {
		// economy time on implementing mapping GET/DELETE requests to SELECT/DELETE queries
		$demoMethods = array('POST', 'PUT');
		$request = $this->getApp()->request;

		$isAllowedMethod = false;
		foreach ($demoMethods as $method) {
			if ($request->isRequestType($method)) {
				$isAllowedMethod = true;
				break;
			};
		}
		if (!$isAllowedMethod) {
			throw new Exception('Only following methods are supported in demo: ' . implode(', ', $demoMethods), 405);
		}

		return true;
	}

	/**
	 * Creates from given associative array set of columns and parameters names, suitable to be passed to INSERT/UPDATE queries
	 * @param array $data
	 * @param int $paramIndex Index to be appended to each parameter name. Useful to create unique names on butch processing
	 * @return array(
	 *  'columns' => string,
	 *  'values' => string,
	 *  'params' => array(paramsName => paramValue)
	 * )
	 */
	protected function composeQueryParams(array $data, $paramIndex = 0) {
		$columns = array_keys($data);
		$paramNames = array_map(function($name) use ($paramIndex) { return ":{$name}_{$paramIndex}"; }, $columns);
		return array(
			'columns' => implode(',', $columns),
			'values' => '(' . implode(',', $paramNames) . ')',
			'params' => array_combine($paramNames, $data),
		);
	}

	/**
	 * @param array $data
	 * @return array
	 */
	abstract protected function composeQuery(array $data);

	protected function getRawModelData() {
		$request = $this->getApp()->request;

		// support 'emulateJSON' Backbone's option - both 'application/json' and 'application/x-www-form-urlencoded' requests:
		if ($request->isJSON()) {
			$data = $request->getRawBody();
		} else {
			$restParams = $request->getRestParams();
			$data = $restParams['model'];
		}

		$data = $this->decode($data);
		if ($data === null) {
			$data = array();
		}

		return $data;
	}

	protected function decode($data) {
		return json_decode($data, true);
	}

	protected function encode($data) {
		return json_encode($data);
	}

	protected function parse(array $data) {
		return $data;
	}

	// shortcut-method
	protected function getApp() {
		return Application::getInstance();
	}
} 