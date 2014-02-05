// a partial shim for convenient Chaplin.View methods
define(function (require) {

	var _ = require('underscore');
	var $ = require('jquery');

	// copied from compiled Chaplin:
	var utils = {
		getPrototypeChain: function (object) {
			var chain, _ref, _ref1, _ref2;
			chain = [object.constructor.prototype];
			while (object = (_ref = (_ref1 = object.constructor) != null ? _ref1.__super__ : void 0) != null ? _ref : (_ref2 = object.constructor) != null ? _ref2.superclass : void 0) {
				chain.push(object);
			}
			return chain.reverse();
		},
		getAllPropertyVersions: function (object, property) {
			var proto, result, value, _i, _len, _ref;
			result = [];
			_ref = utils.getPrototypeChain(object);
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				proto = _ref[_i];
				value = proto[property];
				if (value && _.indexOf(result, value) < 0) {
					result.push(value);
				}
			}
			return result;
		}
	};

	var BaseView = require('backbone').View;

	var optionNames = ['autoAttach', 'autoRender', 'container', 'containerMethod'];

	var View = BaseView.extend({
		container: null,
		containerMethod: 'append',
		autoRender: false,
		autoAttach: true,
		template: null,

		constructor: function () {
			BaseView.apply(this, arguments);
			this.delegateListeners();

			// defer, to allow constructor to be executed completely first (including another mixins, if exists)
			if (this.autoRender) {
				_.defer(_.bind(this.render, this));
			}
			if (this.autoAttach) {
				_.defer(_.bind(this.attach, this));
			}
		},

		_configure: function(options) {
			BaseView.prototype._configure.apply(this, arguments);
			_.extend(this, _.pick(options, optionNames));
			return this;
		},

		render: function () {
			var html, templateFunc;
			templateFunc = this.getTemplateFunction();
			if (typeof templateFunc === 'function') {
				html = templateFunc(this.getTemplateData());
				this.$el.html(html);
			}
			return this;
		},

		attach: function () {
			if (this.container && !document.body.contains(this.el)) {
				$(this.container)[this.containerMethod](this.el);
				return this.trigger('addedToDOM');
			}
			return this;
		},

		// implement Chaplin.View abstract method:
		getTemplateFunction: function () {
			var template, templateFunc;
			template = this.template;
			if (typeof template === 'string') {
				templateFunc = _.template(template);
				this.constructor.prototype.template = templateFunc;
			} else {
				templateFunc = template;
			}
			return templateFunc;
		},

		getTemplateData: function () {
			var data;
			if (this.model) {
				data = this.model.toJSON();
			} else if (this.collection) {
				data = {
					// copied from Chaplin.View:
					items: this.collection.toJSON(),
					length: this.collection.length
				};
			} else {
				data = {};
			}
			return this._formatTemplateData(data);
		},

		/**
		 * Modifies fetched template data to always set a common top-level key -
		 * to avoid underscore template exception when some attribute is undefined
		 *
		 * @param {Object} data
		 * @returns {Object}
		 */
		_formatTemplateData: function(data) {
			if (this.model) {
				data = { model: data };
			} else if (this.collection) {
				data = { collection: data };
			} else {
				data = { data: data };
			}
			return data;
		},

		// copied from compiled Chaplin:

		delegateListeners: function () {
			var eventName, key, method, target, version, _i, _len, _ref, _ref1;
			if (!this.listen) {
				return;
			}
			_ref = utils.getAllPropertyVersions(this, 'listen');
			for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				version = _ref[_i];
				for (key in version) {
					method = version[key];
					if (typeof method !== 'function') {
						method = this[method];
					}
					if (typeof method !== 'function') {
						throw new Error('View#delegateListeners: ' + ("" + method + " must be function"));
					}
					_ref1 = key.split(' '), eventName = _ref1[0], target = _ref1[1];
					this.delegateListener(eventName, target, method);
				}
			}
		},

		delegateListener: function (eventName, target, callback) {
			var prop;
			if (target === 'model' || target === 'collection') {
				prop = this[target];
				if (prop) {
					this.listenTo(prop, eventName, callback);
				}
			} else if (!target) {
				this.on(eventName, callback, this);
			}
		}
	});

	return View;
});
