<?php

class Component {

	public function __get($property) {
		$method = 'get' . $property;
		if (method_exists($this, $method)) {
			return call_user_func(array($this, $method));
		}
		throw new Exception("Missing property '" . get_class($this) . "::{$property}'!");
	}

	public function __set($property, $value) {
		$method = 'set' . $property;
		if (method_exists($this, $method)) {
			return call_user_func(array($this, $method), $value);
		}
		throw new Exception("Missing property '" . get_class($this) . "::{$property}'!");
	}

	public function __call($method, $parameters) {
		throw new Exception("Missing method '" . get_class($this) . '::' . "{$method}'!");
	}

	public function __construct(array $config = array()) {
		$this->applyConfig($config);
	}

	public function applyConfig(array $config) {
		foreach ($config as $name => $value) {
			if (!is_object($this->$name)) {
				$this->$name = $value;
			} else {
				$this->$name->applyConfig($value);
			}
		}
	}

}