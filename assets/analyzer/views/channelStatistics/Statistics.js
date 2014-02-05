define(function (require) {

	var BaseView = require('base/View');

	var View = BaseView.extend({
		template: require('text!./template.html'),

		getTemplateData: function () {
			return this._formatTemplateData(this.model.omit('movies'));
		}
	});

	return View;
});
