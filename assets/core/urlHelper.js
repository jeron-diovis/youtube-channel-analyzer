define(function () {

	return {
		getBaseUrl: function () {
			return 'server/index.php'
		},

		createUrl: function (url) {
			return this.getBaseUrl() + '/' + url;
		}
	}
});
