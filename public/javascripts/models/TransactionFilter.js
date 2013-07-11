define(['Backbone', 'underscore','moment'], function(Backbone, _,moment){
    /**
     *
     * This defines a Family
     * 
     * @type {*}
     */

    var TransactionFilter = Backbone.Model.extend({
            defaults: {
                filter_type: "all",
                month: moment(), 
                from_date: moment(), 
                to_date: moment(),
            }
        

    });

    return TransactionFilter;
});
