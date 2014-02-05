define(function (require) {

	var BaseView = require('base/View');

	var Backgrid = require('backgrid/backgrid');
	require('backgrid/ext/backgrid-paginator');
	require('backgrid/ext/backgrid-filter');

	var Paginator = Backgrid.Extension.Paginator.extend({
		renderIndexedPageHandles: false,
		goBackFirstOnSort: false,
		initialize: function() {
			Backgrid.Extension.Paginator.prototype.initialize.apply(this, arguments);
			// since it is impossible to get *indexed* page of google feed, remain only buttons back/forward
			this.controls = _.omit(this.controls, 'rewind', 'fastForward');
			return this;
		}
	});

	var Filter = Backgrid.Extension.ClientSideFilter.extend({
		initialize: function() {
			Backgrid.Extension.ClientSideFilter.prototype.initialize.apply(this, arguments);
			this.listenTo(this.collection, 'page:changed', this.search);
			return this;
		}
	});

	var View = BaseView.extend({
		template: require('text!./template.html'),

		initialize: function () {
			BaseView.prototype.initialize.apply(this, arguments);
			this._initSubviews();
			return this;
		},

		render: function() {
			BaseView.prototype.render.apply(this, arguments);

			_.each({
				pager: 'div.pager',
				filter: 'div.filter',
				grid: 'div.list'
			}, function (selector, subviewName) {
				this.$(selector).append(this.subviews[subviewName].render().el);
			}, this);

			return this;
		},

		_initSubviews: function () {
			var collection = this.collection;

			var subviews = {
				pager: new Paginator({
					collection: collection
				}),

				filter: new Filter({
					collection: collection,
					fields: ['title']
				}),

				grid: new Backgrid.Grid({
					collection: collection,
					columns: [
						{
							name: 'title',
							label: 'Title',
							cell: 'string',
							editable: false,
							sortType: 'toggle'
						},
						{
							name: 'link',
							label: 'URL',
							cell: 'uri',
							editable: false,
							sortType: 'toggle'
						},
						{
							name: 'description',
							label: 'Description',
							cell: Backgrid.StringCell.extend({
								className: _.result(Backgrid.StringCell.prototype, 'className') + ' movie-description'
							}),
							editable: false,
							sortType: 'toggle'
						}
					]
				})
			};

			// as it is described in 'MoviesList' collection - filtration, like a pagination also, should work in client mode
			// so need to 'deceive' a standard filter behavior
			collection.on('sync', function (collection) {
				subviews.filter.shadowCollection.reset(collection.slice());
			});

			this.subviews = subviews;
			return this;
		}
	});

	return View;
});
