import buildCategoryRoute from 'discourse/routes/build-category-route';
import buildTopicRoute from 'discourse/routes/build-topic-route';
import DiscoverySortableController from 'discourse/controllers/discovery-sortable';

export default {
  name: 'dynamic-route-builders',
  after: 'register-discourse-location',

  initialize: function(container, app) {
    var builder = (
        function(prefix, archetype){
            app[prefix + "CategoryRoute"] = buildCategoryRoute('latest', {archetype: archetype});
            app[prefix + "ParentCategoryRoute"] = buildCategoryRoute('latest', {archetype: archetype});
            app[prefix + "CategoryNoneRoute"] = buildCategoryRoute('latest', {no_subcategories: true, archetype: archetype});

            Discourse.Site.currentProp('filters').forEach(function(filter) {
               app[prefix + filter.capitalize() + "Controller"] = DiscoverySortableController.extend();
               app[prefix + filter.capitalize() + "Route"] = buildTopicRoute(filter, archetype);
               app[prefix + filter.capitalize() + "CategoryRoute"] = buildCategoryRoute(filter, {archetype: archetype});
               app[prefix + filter.capitalize() + "CategoryNoneRoute"] = buildCategoryRoute(filter, {no_subcategories: true, archetype: archetype});
            });

            Discourse.DiscoveryTopRoute = buildTopicRoute('top', archetype, {
            // THESE ARE PASSED AS 'extras'
              actions: {
                willTransition: function() {
                  Discourse.User.currentProp("should_be_redirected_to_top", false);
                  Discourse.User.currentProp("redirected_to_top_reason", null);
                }
              }
            });

            Discourse.DiscoveryTopCategoryRoute = buildCategoryRoute('top', {archetype: archetype});
            Discourse.DiscoveryTopCategoryNoneRoute = buildCategoryRoute('top', {no_subcategories: true, archetype: archetype});

            Discourse.Site.currentProp('periods').forEach(function(period) {
              app[prefix + "Top" + period.capitalize() + "Controller"] = DiscoverySortableController.extend();
              app[prefix + "Top" + period.capitalize() + "Route"] = buildTopicRoute('top/' + period, archetype);
              app[prefix + "Top" + period.capitalize() + "CategoryRoute"] = buildCategoryRoute('top/' + period, { archetype: archetype});
              app[prefix + "Top" + period.capitalize() + "CategoryNoneRoute"] = buildCategoryRoute('top/' + period, {no_subcategories: true, archetype: archetype});
            });
        }
    );

    builder('Discovery');

    Discourse.Site.currentProp('archetypes').forEach(function(arch){
        builder('Arch' + arch.id, arch.id);
    });
  }
};
