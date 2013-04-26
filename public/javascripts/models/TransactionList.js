define(['Backbone', 'underscore','./Transaction'], function(Backbone, _,Transaction){
    var TranactionList = Backbone.Collection.extend({
        model: Transaction
    });

    return TranactionList;
});