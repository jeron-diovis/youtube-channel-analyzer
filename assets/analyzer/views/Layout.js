define(function (require) {

	var _ = require('underscore');

	var BaseView = require('base/View');
	var StatisticsView = require('./channelStatistics/Statistics');
	var MoviesListView = require('./moviesList/Grid');

	var channelUrlRegex = /(?:http:\/\/(?:www\.)?\/)?youtube.com\/user\/(\w+)/; // cached regexp

	var View = BaseView.extend({

		el: '#youtube-analyzer',

		events: {
			'submit form': function (e) {
				e.preventDefault();
				var channelUrl = this.$('input#channel-link').val();
				this.loadChannel(channelUrl);
			}
		},

		initialize: function () {
			BaseView.prototype.initialize.apply(this, arguments);
			this.toggleLoadingState(false);
			this._initSubviews();
			return this;
		},

		renderError: function (error) {
			this.$('#channel-link-error').html(error);
			return this;
		},

		clear: function () {
			this.renderError('');
			_.chain(this.subviews).pluck('$el').invoke('empty');
			return this;
		},

		toggleLoadingState: function (state) {
			function getMethod(state) {
				return state ? 'show' : 'hide';
			}

			this.$('#loader')[getMethod(state)]();
			this.$('#btn-submit')[getMethod(!state)]();
			return this;
		},

		_initSubviews: function () {
			var subviews = {};

			var statistics = new StatisticsView({
				model: this.model,
				el: '#channel-stats'
			});
			subviews.statistics = statistics;

			var moviesList = new MoviesListView({
				collection: this.collection,
				el: '#channel-movies'
			});
			subviews.movies = moviesList;

			this.subviews = subviews;
			return this;
		},

		loadChannel: function(channelUrl) {
			var view = this;

			view.clear();

			if (!_.isString(channelUrl) || !channelUrlRegex.test(channelUrl)) {
				view.renderError('Wrong channel url format');
				return false;
			}

			var channelName = channelUrlRegex.exec(channelUrl)[1];
			var dfd = view.model.loadChannel(channelName)
				.then(function () {
					return view.collection.loadPlaylist(view.model.get('moviesListId'));
				})
				.then(function () {
					return $.when(view.model.save(), view.collection.batchSave());
				});

			dfd.done(function () {
					_.invoke(view.subviews, 'render');
				})
				.fail(function (response) {
					view.renderError(response.responseText);
				})
				.always(function () {
					view.toggleLoadingState(false);
				});

			view.toggleLoadingState(true);

			return dfd;
		}
	});

	return View;
});
