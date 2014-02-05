<?php

class Autoloader {
	protected static $_selfInstance = null;
	protected $_classPaths = array();

	public static function getInstance() {
		return self::$_selfInstance;
	}

	public function __construct() {
		if (is_object(self::$_selfInstance)) {
			throw new Exception('Autoloader instance has been already created!');
		}
		self::$_selfInstance = $this;

		spl_autoload_register(array($this, 'autoload'));
	}

	public function setClassPaths(array $classPaths) {
		$this->clearClassPaths();
		foreach ($classPaths as $path) {
			$this->addClassPath($path);
		}
		return true;
	}

	public function getClassPaths() {
		return $this->_classPaths;
	}

	public function clearClassPaths() {
		$this->_classPaths = array();
		return true;
	}

	public function addClassPath($path) {
		$realPath = realpath($path);
		$className = basename($realPath, '.php');
		if (empty($className)) {
			throw new Exception("Path '{$path}' is not a valid path to the class file!");
		}
		$this->_classPaths[$className] = $realPath;
		return $className;
	}

	public function addDirectory($path) {
		if (is_file($path)) {
			throw new Exception('Path must lead to the directory!');
		}
		$files = scandir($path);
		unset($files[0], $files[1]);
		foreach ($files as $file) {
			$filePath = $path . '/' . $file;
			if (!is_file($filePath)) {
				$this->addDirectory($filePath);
			} else {
				$this->addClassPath($filePath);
			}
		}
	}

	public function autoload($className) {
		if (array_key_exists($className, $this->_classPaths)) {
			require_once($this->_classPaths[$className]);
			return true;
		}
		return false;
	}
}