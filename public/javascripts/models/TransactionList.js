define(['Backbone', 'underscore','./Transaction','moment'], function(Backbone, _,Transaction,moment){
    var TranactionList = Backbone.Collection.extend({
        model: Transaction,
        comparator: function(transaction) {
        	return moment(transaction.get("transaction_date")).valueOf();
        }
    });

    return TranactionList;
});