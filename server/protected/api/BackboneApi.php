<?php

Autoloader::getInstance()->addDirectory(__DIR__ . '/endpoints');

/**
 * Class BackboneApi
 *
 * Actually, this should be just a controller
 *
 * This class unifies logic for fetching data from request and updating db.
 * Of course, db logic must me moved to something like ActiveRecord, but we should not implement it here to save the time
 *
 * Also, using REPLACE with big data amounts is not a best practice.
 * But, perhaps, it is better then a lot of separate INSERTs for each model, as it is supplied by Backbone ideology.
 * So we shall not create a separate endpoint for 'Movie' model
 */
class BackboneApi extends Component {

	protected function endpoints() {
		$path = __DIR__ . '/endpoints';
		return array(
			'channel' => array(
				'class' => "{$path}/ChannelEndpoint.php",
			),
			'movies' => array(
				'class' => "{$path}/MoviesEndpoint.php",
			),
		);
	}

	public function runEndpoint($name) {
		$configs = $this->endpoints();
		if (!array_key_exists($name, $configs)) {
			throw new Exception("Endpoint '{$name}' does not exist");
		}

		$endpoint = Application::getInstance()->createComponent($configs[$name]);
		return $endpoint->run();
	}
} 