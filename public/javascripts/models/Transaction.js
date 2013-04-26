define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a Family
     * 
     * @type {*}
     */

    var Transaction = Backbone.Model.extend({
    	defaults: {
    		from: null,
    		to: null,
    		points: 0,
    		date: null,
    	}
    });


    return Transaction;

});
