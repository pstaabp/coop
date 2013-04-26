define(['Backbone', 'underscore','./Family'], function(Backbone, _,Family){
    var FamilyList = Backbone.Collection.extend({
        model: Family
    });

    return FamilyList;
});