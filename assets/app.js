define(function (require) {

	require('configs/backbone');

	var Backbone = require('backbone');
	var Analyzer = require('analyzer');

	var Router = Backbone.Router.extend({
		routes: {
			'': 'index',
			'index': 'index'
		},

		index: function () {
			var analyzer = new Analyzer();
			analyzer.run();
		}
	});

	var router = new Router();
	Backbone.history.start({
		pushState: true,
		root: location.pathname
	});
});