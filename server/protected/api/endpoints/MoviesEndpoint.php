<?php

/**
 * Class MoviesEndpoint
 *
 * Using REPLACE with big data amounts is not a best practice.
 * But, perhaps, it is better then a lot of separate INSERTs for each model, as it is supplied by Backbone ideology.
 * So we shall not create a separate endpoint for 'Movie' model
 */
class MoviesEndpoint extends AbstractApiEndpoint {

	/**
	 * @param array $data
	 * @return array
	 */
	protected function composeQuery(array $data) {
		$params = call_user_func_array('array_merge_recursive',
			array_map(
				array($this, 'composeQueryParams'),
				$data,
				range(1, count($data))
			)
		);
		$params['values'] = implode(',', $params['values']);
		$params['columns'] = $params['columns'][0];
		return array(
			"REPLACE INTO movie ({$params['columns']}) VALUES {$params['values']}",
			$params['params']
		);
	}
} 