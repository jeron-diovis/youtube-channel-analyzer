define(function (require) {

	var View = require('./views/Layout');
	var Model = require('./data/Channel');
	var Collection = require('./data/MoviesList');

	function Analyzer() {}

	Analyzer.prototype.run = function () {
		var view = new View({
			model: new Model(),
			collection: new Collection()
		});
	};

	return Analyzer;
});
