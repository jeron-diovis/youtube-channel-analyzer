require.config({
	paths: {
		// libs:
		'jquery': 'core/libs/jquery',
		'underscore': 'core/libs/lodash',
		'backbone': 'core/libs/backbone',
		'chaplin': 'core/libs/chaplin',
		'text': 'core/libs/text',

		// custom core components:
		'base': 'core/baseComponents',
		'urlHelper': 'core/urlHelper',

		// third-party extensions:
		'backgrid': 'core/ext/backgrid',

		'configs': 'core/config'
	},

	shim: {
		'underscore': {
			exports: '_'
		},

		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},

		// it supports commonJS, but does not support AMD. Strange
		'backgrid/backgrid': {
			deps: ['backbone'],
			exports: 'Backgrid'
		},

		'backgrid/ext/backgrid-paginator': {
			deps: ['backgrid/backgrid']
		},

		'backgrid/ext/backgrid-filter': {
			deps: ['backgrid/backgrid']
		}
	},

	urlArgs: "bust=" + (new Date()).getTime(),

	packages: [
		'analyzer'
	]
});
require(['app']);