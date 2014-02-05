<?php

require_once('protected/core/Autoloader.php');
$autoloader = new Autoloader;
$autoloader->addDirectory('protected/core');

$app = new Application(array(
	'components' => array(
		'db' => array(
			'class' => 'protected/core/components/Database.php',
			'dataSourceName' => 'mysql:host=localhost;dbname=vsp_test',
			'user' => 'devel',
			'password' => 'devel',
		),
		'backboneApi' => array(
			'class' => 'protected/api/BackboneApi.php'
		),
	)
));
$app->run();