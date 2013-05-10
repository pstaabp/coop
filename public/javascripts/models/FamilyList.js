define(['Backbone', 'underscore','./Family'], function(Backbone, _,Family){
    var FamilyList = Backbone.Collection.extend({
        model: Family,
        comparator: function (family) {return family.get("name"); }
    });

    return FamilyList;
});