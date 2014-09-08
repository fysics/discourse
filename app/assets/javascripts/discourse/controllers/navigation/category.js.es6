import NavigationDefaultController from 'discourse/controllers/navigation/default';

export default NavigationDefaultController.extend({
  subcategoryListSetting: Discourse.computed.setting('show_subcategory_list'),
  showingParentCategory: Em.computed.none('category.parentCategory'),
  showingSubcategoryList: Em.computed.and('subcategoryListSetting', 'showingParentCategory'),

  navItems: function() {
    if (this.get('showingSubcategoryList')) { return []; }
    var args = { noSubcategories: this.get('noSubcategories') };
    if (this.get("archetype")){
      args.archetype = this.get("archetype");
    }
    return Discourse.NavItem.buildList(this.get('category'), args);
  }.property('category','noSubcategories','archetype')
});
