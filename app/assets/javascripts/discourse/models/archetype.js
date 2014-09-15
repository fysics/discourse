/**
  A data model for archetypes such as polls, tasks, etc.

  @class Archetype
  @extends Discourse.Model
  @namespace Discourse
  @module Discourse
**/
Discourse.Archetype = Discourse.Model.extend({

  hasOptions: Em.computed.gt('options.length', 0),

  site: function() {
    return Discourse.Site.current();
  }.property(),

  isDefault: Discourse.computed.propertyEqual('id', 'site.default_archetype'),
  notDefault: Em.computed.not('isDefault')

});

Discourse.Archetype.reopenClass({
   getSlug: function(id){
     return Discourse.Site.currentProp("archetypes").findBy("id", id).slug;
   },
   getForCapability: function(cap) {
     return Discourse.Site.currentProp("archetypes").filter(function(arch){
       return arch.capabilities && arch.capabilities.indexOf(cap) != -1;
     });
   }
});


