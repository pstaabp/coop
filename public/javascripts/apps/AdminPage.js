

require(['globals', 'Backbone', 'underscore','../views/WebPage','../models/Family',
         '../models/FamilyList','../models/TransactionList', 
         '../models/Transaction','./FamilyView',  './common', 
         './TransactionsView','../models/SettingsList','SettingsView', 'bootstrap'],
function(globals, Backbone, _, WebPage, Family, FamilyList, TranasactionList, Transaction,FamilyView,
            common,TransactionsView,SettingsList,SettingsView){

   var AdminPage = WebPage.extend({
      initialize: function () {
         var self = this;
         this.constructor.__super__.initialize.apply(this, {el: this.el});
         _.bindAll(this,"render");
         
         $("#logout").on("click",common.logout);

         this.families = (globals.families)? new FamilyList(globals.families) : new FamilyList(); 
         this.transactions = (globals.transactions) ? new TranasactionList(globals.transactions) : new TranasactionList();
         this.settings = (globals.settings) ? new SettingsList(globals.settings) : new SettingsList();
         
         this.families.on("add",function(model){
            self.announce.addMessage("Added the " + model.get("name") + " family.");
         });
         this.transactions.on("add",function(model){
            self.announce.addMessage("Added a transaction on " + moment(model.get("transaction_date")).format("MM/DD/YYYY"));
         });

         this.transactions.on("sync",function(trans){
          var fromFamilyID = trans.get("from_family");
          var fromFamily = (fromFamilyID == "0") ? "Secretary" : self.families.get(fromFamilyID).get("name");
          var toFamily = self.families.get(trans.get("to_family")).get("name");
          self.announce.addMessage("Updated the transactions from the " + fromFamily + " family to the "
              + toFamily + " family on " + moment(trans.get("transaction_date")).format("MM/DD/YYYY"));
         });

         this.families.on("sync",function(model){
            self.announce.addMessage("Updated the " + model.get("name") + " family.");
         });

         this.settings.on("sync", function(model) {
              self.announce.addMessage("The " + model.get("name") + " setting has been updated and now has the value " +
                model.get("value"))});

         this.views = {
            familyView : new FamilyView({families: this.families, el: $("#view-families"), settings: this.settings, 
                                    transactions: this.transactions}),
            transactionsView : new TransactionsView({transactions: this.transactions, families: this.families,
              el: $("#transactions"), settings: this.settings}),
            settingsView : new SettingsView({settings: this.settings, el: $("#settings")})
         }
         this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
         this.views.transactionsView.render();
      },
      render: function (evt) {
         this.views[$(evt.target).data("view")].render();
      }, 
      events: { "shown #admin-tabs a": "render"}

    });

    new AdminPage({el: $("#container")});
});