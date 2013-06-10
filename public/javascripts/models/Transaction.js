define(['Backbone', 'underscore','moment'], function(Backbone, _){
    /**
     *
     * This defines a Family
     * 
     * @type {*}
     */

    var Transaction = Backbone.Model.extend({
    	defaults: {
    		from_family: null,
    		to_family: null,
    		points: 0,
    		transaction_date: new Date(),
    	},
       // validation: {pattern: /^\d+(\.[0|5])?$/, msg: "The number of points must be either whole or half points."}
       url : function() {
            var base = '/coop/transactions';
            if (this.isNew()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
        },
        idAttribute: "_id",
    });


    return Transaction;

});
