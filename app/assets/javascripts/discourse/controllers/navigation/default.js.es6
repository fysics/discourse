import DiscourseController from 'discourse/controllers/controller';

export default DiscourseController.extend({
  categories: function() {
    return Discourse.Category.list();
  }.property('archetype'),

  navItems: function() {
    var args = [];
    if (this.get("archetype")){
      args.archetype = this.get("archetype")
    }
    return Discourse.NavItem.buildList('', args);
  }.property('archetype')
});
