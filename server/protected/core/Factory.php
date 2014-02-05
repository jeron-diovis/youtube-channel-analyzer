<?php

class Factory extends Component {
	protected $_components = array();
	protected $_preloadComponentNames = array();

	public function __construct(array $config = array()) {
		parent::__construct($config);
		$this->preloadComponents();
	}

	public function __get($propertyName) {
		try {
			return parent::__get($propertyName);
		} catch (Exception $exception) {
			if ($this->hasComponent($propertyName)) {
				return $this->getComponent($propertyName);
			} else {
				throw $exception;
			}
		}
	}

	public function getComponents() {
		return $this->_components;
	}

	public function setComponents(array $components) {
		foreach ($components as $name => $component) {
			$this->addComponent($name, $component);
		}
		return true;
	}

	public function addComponent($name, $data) {
		if (is_scalar($data)) {
			return false;
		}
		$this->_components[$name] = $data;
		return true;
	}

	public function hasComponent($componentName) {
		return array_key_exists($componentName, $this->_components);
	}

	public function getComponent($name) {
		$component = $this->_components[$name];
		if (!is_object($component)) {
			$component = $this->createComponent($component);
			$this->_components[$name] = $component;
		}
		return $component;
	}

	public function createComponent(array $config) {
		$className = $config['class'];
		if (empty($className)) {
			throw new Exception('Component config should contain parameter "class"!');
		}
		unset($config['class']);
		if (!class_exists($className)) {
			$className = Autoloader::getInstance()->addClassPath($className);
		}

		$component = new $className($config);
		return $component;
	}

	public function setPreloadComponentNames(array $preloadComponentNames) {
		$this->_preloadComponentNames = $preloadComponentNames;
		return true;
	}

	public function getPreloadComponentNames() {
		return $this->_preloadComponentNames;
	}

	protected function preloadComponents() {
		foreach ($this->_preloadComponentNames as $componentName) {
			$component = $this->__get($componentName);
			if (!is_object($component)) {
				throw new Exception("Unable to preload component '{$componentName}'!");
			}
		}
		return true;
	}
}