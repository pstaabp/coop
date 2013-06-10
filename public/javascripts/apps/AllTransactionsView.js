define(['Backbone','underscore','moment','../models/Transaction'],function(Backbone,_,moment,Transaction){
	
 var AllTransactionsView = Backbone.View.extend({
      initialize: function (){
         _.bindAll(this,"render","showTransactions","filterTransactions","updatePoints");
         this.transactions = this.options.transactions;
         this.rowTemplate = $("#transaction-row-template").html();
         this.families = this.options.families;
         this.familyList = this.families.map(function(family){ return {name: family.get("name"), id: family.id} });
         this.familyList.push({name: "Secretary", id: "0"});
         this.transactions.on("remove",this.render);
         this.transactions.on("change",this.updatePoints);
         this.currentView = {view: "all"};
      },
      render: function(){
      	this.$el.html($("#all-transactions-template").html());
         this.showTransactions();
      },
      filterTransactions: function () {
      	switch(this.$("input[name='trans-view']:checked").val()){
         	case "all": 
         		this.filteredTransactions = this.transactions.toArray(); 
         		this.currentView = {view: "all"};
         		break;
         	case "month": 
         		this.currentView = {view: "month", date: this.$(".month-view").val()};
         		this.filteredTransactions = this.transactions.filter(function(trans){
         			return moment(trans.get("transaction_date")).isSame(moment(self.$(".month-view").val(),"MM/YYYY"),"month");
	         	});
         	break;
         	
         }
      },
      updatePoints: function () {
      	this.filterTransactions();
      	var totalPoints = _(this.filteredTransactions).reduce(function(num,trans) { return parseFloat(trans.get("points")) + num; }, 0);
      	this.$(".transaction-totals").html("Total number of points transferred is " + totalPoints);
      },
      showTransactions: function () {

      	var self = this
      		, table = this.$("#transactions-table tbody");

      	this.currentView.date = this.$(".month-view").val();
			table.html("");
         this.filterTransactions();

         _(this.filteredTransactions).each(function(transaction){
            table.append( (new TransactionRow({model: transaction, rowTemplate: self.rowTemplate, 
            		families: self.families, familyList: self.familyList})).render().el);
         });
         this.updatePoints();

      },
      events: { "change input[name='trans-view']": "showTransactions",
   				 "change .month-view": "showTransactions"}

   });

   var TransactionRow = Backbone.View.extend({
      tagName: "tr",
      initialize: function(){
         _.bindAll(this,"render");
         this.rowTemplate = this.options.rowTemplate;
         this.families = this.options.families;
         this.familyList = this.options.familyList;
         this.editable = this.options.editable ? this.options.editable: false;

      },
      render: function (){
         this.$el.html(this.rowTemplate);
         this.$(".transaction-date").datepicker().datepicker("option",{disabled: !this.editable});
         this.stickit();
         return this; 
      },
      events: {
         "click .delete-transaction" : "deleteTransaction",
         "click .edit-transaction": "editTransaction",
         "click .save-transaction": "saveTransaction"
      },
      bindings: {".family-to": { observe: "to_family",
                  selectOptions: {collection: "this.familyList", labelPath: "name", valuePath: "id"}
               },
               ".family-from": {observe: "from_family",
                       selectOptions: {collection: "this.familyList", labelPath: "name", valuePath: "id"}
               },
               ".points": "points",
               ".transaction-date": {observe: "transaction_date",
		            onGet: function(value, options) { return moment(value).format("MM/DD/YYYY");},
		            onSet: function(value,options) { return moment(value).toDate(); }
         }
       },
       deleteTransaction: function () {
         var del = confirm("Do you wish to remove the transaction on date " + moment(this.model.get("transaction_date")).format("MM/DD/YYYY"));
         if (del) {this.model.destroy();}
       },
       toggleEditable: function () {
         this.$(".family-to, .family-from, .transaction-date").prop("disabled",this.editable);
         this.$(".points").prop("contenteditable", !this.editable);
         this.$(".transaction-date").datepicker("option", {disabled: this.editable});
         this.stickit();
         this.editable = !this.editable;
       },
       editTransaction: function() {
         if (this.editable) { return; }
         this.toggleEditable();
       },
       saveTransaction: function () {
        	console.log("in saveTransaction");
         if (!this.editable) { return; }
         this.toggleEditable();
         this.model.save();
       }
   });

return AllTransactionsView;

});

