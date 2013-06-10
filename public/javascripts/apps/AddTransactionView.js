define(['Backbone','underscore','moment','../models/Transaction'],function(Backbone,_,moment,Transaction){
	
	var AddTransactionView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render");
         this.model = new Transaction();
         this.families = this.options.families;
         this.transactions = this.options.transactions;

         this.familyList = this.families.map(function(family) {return {name: family.get("name"), id: family.id}});
         this.familyList.unshift({name: "Secretary", id: "0"});
      },
      render: function () {
         this.$(".transaction-date").datepicker();
         //Backbone.Validation.bind(this);
         this.stickit();
         return this;
      },

      events: {"click #new-transaction-button": "saveTransaction"},
      saveTransaction: function(){
      	var self = this;
         // save the transaction and then create an empty one. 
         this.model.save(this.model.attributes,{success: function (model, response, options){
         	self.transactions.add(model);
         	self.model = new Transaction();
         	self.stickit();
         }});
      },
      bindings: {
         'select#family-from': {
            observe: 'from_family',
            selectOptions: {
              collection: 'this.familyList',
              labelPath: 'name',
              valuePath: 'id',
              defaultOption: {label: "Choose one...", value: null}
            }
         },
         'select#family-to': {
            observe: 'to_family',
            selectOptions: {
              collection: 'this.familyList',
              labelPath: 'name',
              valuePath: 'id',
              defaultOption: {label: "Choose one...", value: null}
            }
         },
         "#points": "points",
         ".transaction-date": {observe: "transaction_date",
            onGet: function(value, options) { return moment(value).format("MM/DD/YYYY");},
            onSet: function(value,options) { return moment(value).utc().format();
            }
         }
      }
   });

	return AddTransactionView;
});