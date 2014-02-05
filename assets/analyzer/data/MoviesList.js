define(function (require) {

	var $ = require('jquery');
	var _ = require('underscore');

	var BaseCollection = require('backgrid/ext/pageable-collection');
	var API = require('analyzer/youtube_api');

	var Collection = BaseCollection.extend({
		model: require('./Movie'),
		playlistId: null,

		url: require('urlHelper').createUrl('movies'),

		queryParams: {
			pageSize: 'maxResults',
			// disable default pagination params to remove them from request:
			totalPages: null,
			totalRecords: null,
			currentPage: null,
			sortKey: null
		},

		state: {
			pageSize: 50
		},

		// all strange looking tricks with 'switch mode' below are to implement non-standard for Backgrid behavior:
		// pagination on server and sorting on client.
		// Because API does not give us any ability for server-side sorting, but some sorting we want to have
		mode: 'server',

		initialize: function() {
			BaseCollection.prototype.initialize.apply(this, arguments);
			this.pageInfo = {
				totalResults: 0,
				nextPageToken: null,
				prevPageToken: null
			};
			return this;
		},

		loadPlaylist: function (playlistId, options) {
			var collection = this;
			playlistId || (playlistId = this.playlistId);

			options = _.defaults(options || {}, { reset: true });
			var xhr = collection.fetch(this._composePlaylistRequestParams(playlistId, options))
				.done(function () {
					collection.playlistId = playlistId;
				});

			return xhr;
		},

		_composePlaylistRequestParams: function (playlistId, options) {
			return API.composeRequestParams('channelMovies', $.extend(true, {}, options || {}, {
				data: {
					playlistId: playlistId,
					part: 'snippet'
				}
			}));
		},

		parse: function (response) {
			this.pageInfo = _.extend(
				_.pick(response.pageInfo, 'totalResults'),
				_.pick(response, 'nextPageToken', 'prevPageToken')
			);
			return response.items;
		},

		fetch: function() {
			var collection = this;
			collection.switchMode('server', { fetch: false });
			return BaseCollection.prototype.fetch.apply(this, arguments).done(function () {
				collection.switchMode('client', {
					models: collection.models,
					fetch: false
				});
			});
		},

		sync: function(method, model, options) {
			options || (options = {});
			var collection = this;

			if (method === 'read') {
				if (!options.url) {
					// dirty
					options = collection._composePlaylistRequestParams(collection.playlistId, options);
				}
			}

			return BaseCollection.prototype.sync.apply(collection, arguments);
		},

		batchSave: function (options) {
			return this.sync('update', this, options);
		},

		// override paginaton methods to adapt to google API:

		hasNext: function () {
			return !_.isEmpty(this.pageInfo.nextPageToken);
		},

		hasPrevious: function () {
			return !_.isEmpty(this.pageInfo.prevPageToken);
		},

		getPage: function (index, options) {
			var collection = this, xhr;
			var map = {
				next: 'nextPageToken',
				prev: 'prevPageToken'
			};
			if (!_.isUndefined(map[index])) {
				xhr = collection.loadPlaylist(collection.playlistId, {
						data: {
							pageToken: collection.pageInfo[map[index]]
						}
					}).then(function () {
						return collection.batchSave();
					});
			} else {
				xhr = BaseCollection.prototype.getPage.apply(collection, arguments);
			}

			return xhr.done(function () {
				collection.trigger('page:changed', collection);
			})
		}
	});

	return Collection;
});
