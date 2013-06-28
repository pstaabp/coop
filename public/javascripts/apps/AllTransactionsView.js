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
         // set up a Backbone.Model to handle the family filter
         var FilterByFamily = Backbone.Model.extend({defaults: {family: "", month: moment(), from_date: moment(), to_date: moment()}}); 
         this.model = new FilterByFamily(); 
      },
      render: function(){
      	this.$el.html($("#all-transactions-template").html());
        this.stickit();
        this.showTransactions();
      },
      filterTransactions: function () {
        var self = this;
        this.filteredTransactions = this.transactions.toArray();
        if (!this.$(".filter-transactions").prop("checked")){
          return;
        }
        if(this.$(".filter-by-family").prop("checked")){
           this.filteredTransactions = _(this.transactions.where({from_family: $(".filter-by-family-select").val()}))
                  .union(this.transactions.where({to_family: $(".filter-by-family-select").val()}))
        }
      	switch(this.$("input[name='trans-view']:checked").val()){
         	case "month": 
         		this.filteredTransactions = this.transactions.filter(function(trans){
         			return moment(trans.get("transaction_date")).isSame(self.model.get("month"),"month");
	         	});
         	break;
         	case "timespan":
            this.filteredTransactions = this.transactions.filter(function(trans){
              return self.model.get("from_date").startOf("day").isBefore(moment(trans.get("transaction_date"))) &&
                  moment(trans.get("transaction_date")).isBefore(self.model.get("to_date").endOf("day"));
                });

          break;
         }
      },
      updatePoints: function () {
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
      toggleFilterByDates: function (){

      },
      toggleFilterTransactions: function (){
        if (this.$(".filter-transactions").prop("checked")){
            this.$(".filter-options").show("slide",{direction: "up"});
        } else {
          this.$(".filter-options").hide("slide",{direction: "up"});
        }
      },
      events: { "change .filter-by-family,.filter-by-dates,input[type='radio'],.filter-by-family-select": "showTransactions",
                "change .filter-transactions": "toggleFilterTransactions",
       				  "change .month-view,.date": "showTransactions"},
      bindings: {".filter-by-family-select": { observe: "family", 
          selectOptions: { collection: "this.familyList", labelPath: "name", valuePath: "id"
                }},
                ".month-view": "month",
                ".from-time": "from_date",
                ".to-time": "to_date"
      }

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

