<?php

class ChannelEndpoint extends AbstractApiEndpoint {

	protected function parse(array $data) {
		$data = array_merge($data, $data['statistics']);
		unset($data['statistics'], $data['movies']);
		return $data;
	}

	/**
	 * @param array $data
	 * @return array
	 */
	protected function composeQuery(array $data) {
		$params = $this->composeQueryParams($data);
		return array(
			"REPLACE INTO channel ({$params['columns']}) VALUES {$params['values']}",
			$params['params']
		);
	}
} 