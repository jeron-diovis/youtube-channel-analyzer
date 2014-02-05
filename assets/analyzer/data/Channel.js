define(function (require) {

	var $ = require('jquery');
	var _ = require('underscore');

	var BaseModel = require('backbone').Model;
	var API = require('analyzer/youtube_api');

	var MoviesList = require('./MoviesList');

	var Model = BaseModel.extend({

		urlRoot: require('urlHelper').createUrl('channel'), // url to save fetched data to our db

		defaults: function () {
			return {
				name: '',
				address: '',
				moviesListId: '',
				statistics: {
					subscriberCount: 0,
					videoCount: 0,
					viewCount: 0
				}
			};
		},

		// override sync to force rejecting deferred when channel is not found.
		// By default, api just returns info like '0 result found' -
		// which is not suitable for our task, where channel MUST to exist
		sync: function (method, model, options) {
			if (method !== 'read') {
				return BaseModel.prototype.sync.apply(this, arguments);
			} else {
				var xhr = BaseModel.prototype.sync(method, model, _.omit(options, 'success', 'error'));

				var dfd = $.Deferred().done(options.success).fail(options.error);
				var fail = function () {
					dfd.reject.apply(dfd, arguments);
				};

				xhr.fail(fail)
					.done(function (response, textStatus, xhr) {
						if (response.pageInfo.totalResults === 0) {
							textStatus = 'error';
							$.extend(xhr, {
								responseText: 'Requested channel does not exist',
								status: 404,
								statusText: 'Not found'
							});
							fail(xhr, textStatus, 'Not found');
						} else {
							dfd.resolve.apply(dfd, arguments);
						}
					});
				return dfd.promise();
			}
		},

		loadChannel: function (channelName, options) {
			channelName || (channelName = this.get('name'));

			var params = API.composeRequestParams('channel', $.extend(true, {}, options || {}, {
				data: {
					forUsername: channelName,
					part: ['statistics', 'contentDetails'].join(',')
				}
			}));

			params.dataSource = 'youtube_api';

			// pass entered name to 'parse'  method,
			// because, it seems, there is no way to obtain real channel name o_O
			// API returns only channel id and title (and title is NOT the same as name)
			params.additionalData = {
				name: channelName
			};

			return this.fetch(params);
		},

		parse: function (response, options) {
			if (options.dataSource === 'youtube_api') {
				// fetch raw data from api

				var rawChannelData = response.items[0];

				var parsed = {
					id: rawChannelData.id,
					moviesListId: rawChannelData.contentDetails.relatedPlaylists.uploads,
					statistics: _.pick(rawChannelData.statistics, 'subscriberCount', 'videoCount', 'viewCount')
				};
				parsed.name = options.additionalData.name;
				parsed.address = API.composeChannelUrl(parsed.name);

				return parsed;
			} else {
				// process response from our server after saving data

				// this will disable updating model's attributes with values, returned by our server (see default success handler in 'save')
				return null; // we can allow it in this example, because exactly know that server will not change passed data anyhow and just put them to db
			}
		}
	});

	return Model;
});
