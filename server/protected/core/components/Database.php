<?php

class Database extends Component {
	protected $_dataSourceName = '';
	protected $_user = '';
	protected $_password = '';
	protected $_connection = null;

	// Set / Get :
	public function setDataSourceName($dataSourceName) {
		$this->_dataSourceName = $dataSourceName;
	}

	public function getDataSourceName() {
		return $this->_dataSourceName;
	}

	public function setPassword($password) {
		$this->_password = $password;
	}

	public function getPassword() {
		return $this->_password;
	}

	public function setUser($user) {
		$this->_user = $user;
	}

	public function getUser() {
		return $this->_user;
	}

	// Main:
	public function connect() {
		$this->_connection = new PDO($this->dataSourceName, $this->user, $this->password);
		$this->_connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		return true;
	}

	public function close() {
		if (is_object($this->_connection)) {
			$this->_connection = null;
		}
		return true;
	}

	public function __destruct() {
		$this->close();
	}

	public function getLastId() {
		return $this->_connection->lastInsertId();
	}

	public function query($sql, $params = null) {
		if (!is_object($this->_connection)) {
			$this->connect();
		}
		$pdoStatement = $this->_connection->prepare($sql);
		if (!$pdoStatement) {
			$errorInfo = $this->_connection->errorInfo();
			throw new Exception($errorInfo[2]);
		}
		if (is_array($params)) {
			$pdoStatement->execute($params);
		} else {
			$pdoStatement->execute();
		}

		return $pdoStatement->fetchAll();
	}

	public function execute($sql, $params = null) {
		if (!is_object($this->_connection)) {
			$this->connect();
		}
		$pdoStatement = $this->_connection->prepare($sql);
		if (!$pdoStatement) {
			$errorInfo = $this->_connection->errorInfo();
			throw new Exception($errorInfo[2]);
		}
		if (is_array($params)) {
			return $pdoStatement->execute($params);
		} else {
			return $pdoStatement->execute();
		}
	}

	public function queryObject($className, $sql, $params = null) {
		if (!is_object($this->_connection)) {
			$this->connect();
		}
		$pdoStatement = $this->_connection->prepare($sql);
		if (!$pdoStatement) {
			$errorInfo = $this->_connection->errorInfo();
			throw new Exception($errorInfo[2]);
		}
		if (is_array($params)) {
			$pdoStatement->execute($params);
		} else {
			$pdoStatement->execute();
		}

		while ($rawRow = $pdoStatement->fetch(PDO::FETCH_ASSOC)) {
			$row = new $className();
			foreach ($rawRow as $name => $value) {
				$row->$name = $value;
			}
			$rows[] = $row;
		}
		return $rows;
	}
}
