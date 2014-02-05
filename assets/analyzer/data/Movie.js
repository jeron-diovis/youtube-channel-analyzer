define(function (require) {

	var _ = require('underscore');

	var BaseModel = require('backbone').Model;
	var API = require('analyzer/youtube_api');

	var Model = BaseModel.extend({

		parse: function (response) {
			var videoId = response.snippet.resourceId.videoId;
			var parsed = _.extend(
				{
					id: response.id,
					channelId: response.snippet.channelId,
					videoId: videoId,
					link: API.composeVideoUrl(videoId)
				},
				_.pick(response.snippet, 'title', 'description')
			);
			return parsed;
		}
	});

	return Model;
});
