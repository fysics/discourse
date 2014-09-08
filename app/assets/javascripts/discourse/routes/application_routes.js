/**
  Builds the routes for the application

  @method buildRoutes
  @for Discourse.ApplicationRoute
**/
Discourse.Route.buildRoutes(function() {
  var router = this;

  // Error page
  this.route('exception', { path: '/exception' });

  this.resource('about', { path: '/about' });

  // Topic routes
  this.resource('topic', { path: '/t/:slug/:id' }, function () {
    this.route('fromParams', { path: '/' });
    this.route('fromParamsNear', { path: '/:nearPost' });
  });

  function discoverer() {
    var router = this;

    // top
    this.route('top');
    this.route('topCategory', { path: '/category/:slug/l/top' });
    this.route('topCategoryNone', { path: '/category/:slug/none/l/top' });
    this.route('topCategory', { path: '/category/:parentSlug/:slug/l/top' });

    // top by periods
    Discourse.Site.currentProp('periods').forEach(function(period) {
      var top = 'top' + period.capitalize();
      router.route(top, { path: '/top/' + period });
      router.route(top + 'Category', { path: '/category/:slug/l/top/' + period });
      router.route(top + 'CategoryNone', { path: '/category/:slug/none/l/top/' + period });
      router.route(top + 'Category', { path: '/category/:parentSlug/:slug/l/top/' + period });
    });

    // filters
    Discourse.Site.currentProp('filters').forEach(function(filter) {
      router.route(filter, { path: '/' + filter });
      router.route(filter + 'Category', { path: '/category/:slug/l/' + filter });
      router.route(filter + 'CategoryNone', { path: '/category/:slug/none/l/' + filter });
      router.route(filter + 'Category', { path: '/category/:parentSlug/:slug/l/' + filter });
    });

    this.route('categories');

    // default filter for a category
    this.route('parentCategory', { path: '/category/:slug' });
    this.route('categoryNone', { path: '/category/:slug/none' });
    this.route('category', { path: '/category/:parentSlug/:slug' });

    // homepage
    this.route(Discourse.Utilities.defaultHomepage(), { path: '/' });
  }

  this.resource('discovery', { path: '/'}, discoverer);

  var discoveryRoutes = [],
    discoveryTemplates = [];

  for (var name in Discourse) {
    if (name.indexOf("Discovery") === 0) discoveryRoutes.push(name.slice(9));
  }

  for (var tmpl in Ember.TEMPLATES) {
    if (tmpl.indexOf("discovery") === 0) discoveryTemplates.push(name.slice(9));
  }

  Discourse.Site.currentProp('archetypes').forEach(function (arch) {
    router.resource('arch' + arch.id, {path: '/' + arch.slug}, discoverer);

    discoveryRoutes.forEach(function (route) {
      Discourse['Arch' + arch.id + route] = Discourse["Discovery" + route].extend({
        archetype_filter: arch.id
      });
    });
    discoveryTemplates.forEach(function (tmpl) {
      Ember.TEMPLATES['arch' + arch.id + tmpl] = Ember.TEMPLATES["discovery" + tmpl];
    });
  });

  this.resource('group', { path: '/groups/:name' }, function() {
    this.route('members');
  });

  // User routes
  this.resource('user', { path: '/users/:username' }, function() {
    this.resource('userActivity', { path: '/activity' }, function() {
      router = this;
      _.map(Discourse.UserAction.TYPES, function (id, userAction) {
        router.route(userAction, { path: userAction.replace('_', '-') });
      });
    });

    this.route('badges');
    this.route('flaggedPosts', { path: '/flagged-posts' });
    this.route('deletedPosts', { path: '/deleted-posts' });

    this.resource('userPrivateMessages', { path: '/private-messages' }, function() {
      this.route('mine');
      this.route('unread');
    });

    this.resource('preferences', function() {
      this.route('username');
      this.route('email');
      this.route('about', { path: '/about-me' });
      this.route('badgeTitle', { path: '/badge_title' });
    });

    this.route('invited');
  });

  this.route('signup', {path: '/signup'});
  this.route('login', {path: '/login'});
  this.route('faq', {path: '/faq'});
  this.route('tos', {path: '/tos'});
  this.route('privacy', {path: '/privacy'});
  this.route('guidelines', {path: '/guidelines'});

  this.resource('badges', function () {
    this.route('show', {path: '/:id/:slug'});
  });
});
