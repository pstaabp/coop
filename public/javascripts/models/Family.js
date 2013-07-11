define(['Backbone', 'underscore','./TransactionList','moment'], function(Backbone, _,TransactionList){
    /**
     *
     * This defines a Family
     * 
     * @type {*}
     */

    var Family = Backbone.Model.extend({
        defaults: {
            name: "",
            parents: "",
            children: "",
            email: "",
            date_joined: moment(),
            date_left: "",
            starting_points: 0
        },
        validation: {
            name: { required: true },
            parents: {required: true},
            children: {required: true},
            email: {pattern: "email", required: true},
            date_joined: {required: true},
            starting_points: {required: true, pattern: /^\d+/}
        },
        url : function() {
            var base = '/coop/families';
            if (this.isNew()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
        },
        idAttribute: "_id",
        initialize:function () {
            this.transactions = new TransactionList();
            this.transactions.url = '/families/' + this.id + '/transactions';
        },
        isActive: function (currentDate) {  // determine if a family is active based on the currentDate
            if(!this.get("date_left")) { return moment(this.get("date_joined")).isBefore(currentDate);}
            
            return (moment(this.get("date_joined")).isBefore(currentDate)) &&
                           (currentDate.isBefore(moment(this.get("date_left"))));
        }

    });

    return Family;
});
