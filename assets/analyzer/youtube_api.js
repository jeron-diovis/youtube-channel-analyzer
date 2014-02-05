define(function () {

	var siteEndpoint = 'http://youtube.com';
	var apiEndpoint = 'https://www.googleapis.com/youtube/v3';
	var servicesMap = {
		channel: 'channels',
		channelMovies: 'playlistItems'
	};

	var API = {

		signRequest: function (requestOptions) {
			return $.extend(true, {}, requestOptions || {}, {
				data: {
					key: 'AIzaSyDtGb04KMEXNmKTpvPZSqkGIlCN3a3MiDw'
				}
			});
		},

		getServiceEndpoint: function (service) {
			if (_.isUndefined(servicesMap[service])) {
				throw new Error('Unknown service "' + service + '"');
			}
			return apiEndpoint + '/' + servicesMap[service];
		},

		composeRequestParams: function (service, options) {
			var params = this.signRequest(options || {});
			params.url = this.getServiceEndpoint(service);
			return params;
		},

		composeChannelUrl: function (channelName) {
			return siteEndpoint + '/user/' + channelName;
		},

		composeVideoUrl: function (videoId) {
			return siteEndpoint + '/watch?v=' + videoId;
		}
	};

	return API;
});
