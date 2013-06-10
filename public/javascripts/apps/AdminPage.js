

require(['globals', 'Backbone', 'underscore','../views/WebPage','../models/Family',
         '../models/FamilyList','../models/TransactionList', 
         '../models/Transaction','./AllFamilyView','./AddFamilyView',  './common','./AddTransactionView', 
         './AllTransactionsView','bootstrap'],
function(globals, Backbone, _, WebPage, Family, FamilyList, TranasactionList, Transaction,AllFamilyView,AddFamilyView, 
            common,AddTransactionView,AllTransactionsView){

   var AdminPage = WebPage.extend({
      initialize: function () {
         var self = this;
         this.constructor.__super__.initialize.apply(this, {el: this.el});
         _.bindAll(this,"render");
         
         $("#logout").on("click",common.logout);

         this.families = (globals.families)? new FamilyList(globals.families) : new FamilyList(); 
         this.transactions = (globals.transactions) ? new TranasactionList(globals.transactions) : new TranasactionList();
         
         this.families.on("add",function(model){
            self.announce.addMessage("Added the " + model.get("name") + " family.");
         });
         this.transactions.on("add",function(model){
            self.announce.addMessage("Added a transaction on " + moment(model.get("transaction_date")).format("MM/DD/YYYY"));
         });

         this.transactions.on("sync",function(trans){
          var fromFamily = self.families.get(trans.get("from_family")).get("name");
          var toFamily = self.families.get(trans.get("to_family")).get("name");
          self.announce.addMessage("Updated the transactions from the " + fromFamily + " family to the "
              + toFamily + " family on " + moment(trans.get("transaction_date")).format("MM/DD/YYYY"));
         });

         this.families.on("change",function(model){
            self.announce.addMessage("Updated the " + model.get("name") + " family.");
         })

         this.views = {
            addTransactionView :  new AddTransactionView({families: this.families, transactions: this.transactions, 
               el: $("#new-transaction")}),
            addFamilyView : new AddFamilyView({parent: this, families: this.families, el: $("#add-family")}),
            allFamilyView : new AllFamilyView({parent: this, el: $("#view-families"), transactions: this.transactions}),
            allTransactionsView : new AllTransactionsView({transactions: this.transactions, families: this.families,
              el: $("#transactions")})
         }
         this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
         this.views.allFamilyView.render();
      },
      render: function (evt) {
         this.views[$(evt.target).data("view")].render();
      }, 
      events: { "shown #admin-tabs a": "render"}

    });

    new AdminPage({el: $("#container")});
});