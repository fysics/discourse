// A helper function to create a category route with parameters
import { queryParams, filterQueryParams } from 'discourse/routes/build-topic-route';

export default function(filter, params) {
//  var archetype = params.archetype || '';

  return Discourse.Route.extend({
    queryParams: queryParams,

    model: function(modelParams) {
      var model = Discourse.Category.findBySlug(modelParams.slug, modelParams.parentSlug);
      if (params.archetype) {
        Discourse.Category.setArchetype(params.archetype);
        model.set("archetype", params.archetype);
      } else {
        
      }
      return model;
    },

    afterModel: function(model, transaction) {
      if (!model) {
        this.replaceWith('/404');
        return;
      }

      this._setupNavigation(model);
      return Em.RSVP.all([this._createSubcategoryList(model),
                          this._retrieveTopicList(model, transaction)]);
    },

    _setupNavigation: function(model) {
      var noSubcategories = params && !!params.no_subcategories,
          filterMode = "category/" + Discourse.Category.slugFor(model) + (noSubcategories ? "/none" : "") + "/l/" + filter,
      opts = {
          category: model,
          filterMode: filterMode,
          noSubcategories: params && params.no_subcategories,
          canEditCategory: Discourse.User.currentProp('staff'),
          canChangeCategoryNotificationLevel: Discourse.User.current()
      };
      opts.archetype = params.archetype || '';

      this.controllerFor('navigation/category').setProperties(opts);
    },

    _createSubcategoryList: function(model) {
      this._categoryList = null;
      if (Em.isNone(model.get('parentCategory')) && Discourse.SiteSettings.show_subcategory_list) {
        var self = this;
        return Discourse.CategoryList.listForParent(model).then(function(list) {
          self._categoryList = list;
        });
      }

      // If we're not loading a subcategory list just resolve
      return Em.RSVP.resolve();
    },

    _retrieveTopicList: function(model, transaction) {
      var listFilter = "category/" + Discourse.Category.slugFor(model) + "/l/" + filter,
          self = this;

      var findOpts = filterQueryParams(transaction.queryParams, params);

      return Discourse.TopicList.list(listFilter, findOpts).then(function(list) {
        // If all the categories are the same, we can hide them
        var hideCategory = !list.get('topics').find(function (t) { return t.get('category') !== model; });
        list.set('hideCategory', hideCategory);
        self.set('topics', list);
      });
    },

    setupController: function(controller, model) {
      var topics = this.get('topics'),
          periods = this.controllerFor('discovery').get('periods'),
          periodId = topics.get('for_period') || (filter.indexOf('/') > 0 ? filter.split('/')[1] : ''),
          filterText = I18n.t('filters.' + filter.replace('/', '.') + '.title', {count: 0});

      Discourse.set('title', I18n.t('filters.with_category', { filter: filterText, category: model.get('name') }));

      this.controllerFor('navigation/category').set('canCreateTopic', topics.get('can_create_topic'));
      this.controllerFor('discovery/topics').setProperties({
        model: topics,
        category: model,
        period: periods.findBy('id', periodId),
        selected: [],
        noSubcategories: params && !!params.no_subcategories
      });

      this.controllerFor('search').set('searchContext', model.get('searchContext'));
      this.set('topics', null);

      this.openTopicDraft(topics);
    },

    renderTemplate: function() {
      this.render('navigation/category', { outlet: 'navigation-bar' });

      if (this._categoryList) {
        this.render('discovery/categories', { outlet: 'header-list-container', model: this._categoryList });
      }
      this.render('discovery/topics', { controller: 'discovery/topics', outlet: 'list-container' });
    },

    deactivate: function() {
      this._super();
      this.controllerFor('search').set('searchContext', null);
    },

    actions: {
      setNotification: function(notification_level){
        this.currentModel.setNotification(notification_level);
      }
    }
  });
}
