<?php

/**
 * Class Application
 *
 * @property HttpRequest request
 * @property Database db
 * @property BackboneApi backboneApi
 */
class Application extends Factory {

	protected static $_selfInstance = null;

	/**
	 * @return Application
	 */
	public static function getInstance() {
		return self::$_selfInstance;
	}

	public function __construct(array $config = array()) {
		if (is_object(self::$_selfInstance)) {
			throw new Exception('Application instance has been already created!');
		}
		self::$_selfInstance = $this;

		$defaultComponents = array(
			'errorHandler' => array(
				'class' => __DIR__ . '/components/ErrorHandler.php',
			),
			'request' => array(
				'class' => __DIR__ . '/components/HttpRequest.php',
			),
		);

		$components = array();
		if (isset($config['components'])) {
			$components = $config['components'];
		}
		$this->setComponents(array_merge_recursive($defaultComponents, $components));

		$this->setPreloadComponentNames(array(
			'errorHandler',
		));

		parent::__construct($config);
	}

	public function run() {
		// TODO: it is logic for 'router' component

		$routes = array(
			'channel' => '/channel(\/\w+)?/',
			'movies' => '/^movies$/',
		);

		$route = $this->request->getRoute();
		$isMatchFound = false;
		foreach ($routes as $key => $pattern) {
			if (preg_match($pattern, $route)) {
				$isMatchFound = true;
				$this->backboneApi->runEndpoint($key);
				break;
			}
		}
		if (!$isMatchFound) {
			throw new Exception("Unknown route '{$route}'", 404);
		}
	}
}