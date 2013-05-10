//require config
require.config({
   paths: {
      "Backbone":             "../backbone",
      "underscore":           "../underscore-min",
      "jquery":               "../jquery",
      "bootstrap":            "../bootstrap.min",
      "backbone-validation":  "../backbone-validation.min",
      "stickit":              "../backbone.stickit",
      "bootstrap-datepicker": "../bootstrap-datepicker",
      "moment":               "../moment"
   },
   urlArgs: "bust=" +  (new Date()).getTime(),
   waitSeconds: 15,
   shim: {
      'underscore': { exports: '_' },
      'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
      'bootstrap':['jquery'],
      'backbone-validation': ['Backbone'],
      'backbone-validation': {deps: ['Backbone', 'jquery','underscore']},
      'bootstrap-datepicker': {deps: ['bootstrap']},
      'stickit': {deps: ['Backbone','jquery','underscore']},
   }
});

require(['globals', 'Backbone', 'underscore','../views/WebPage','../models/Family','../models/FamilyList','../models/TransactionList', 
         '../models/Transaction','./AllFamilyView','./AddFamilyView',  './common','bootstrap','stickit','backbone-validation','bootstrap-datepicker'],
function(globals, Backbone, _, WebPage, Family, FamilyList, TranasactionList, Transaction,AllFamilyView,AddFamilyView, common, XDate){

   var AdminPage = WebPage.extend({
      initialize: function () {
         var self = this;
         this.constructor.__super__.initialize.apply(this, {el: this.el});
         _.bindAll(this,"render");
         
         $("#logout").on("click",common.logout);

         this.families = (globals.families)? new FamilyList(globals.families) : new FamilyList(); 

         this.families.on("add",function(model){
            self.announce.addMessage("Added the " + model.get("name") + " family.");
         });

         this.families.on("update",function(model){
            self.announce.addMessage("Updated the " + model.get("name") + " family.");
         })

         this.views = {
            addTransactionView :  new AddTransactionView({families: this.families, el: $("#new-transaction")}),
            addFamilyView : new AddFamilyView({parent: this, families: this.families, el: $("#add-family")}),
            allFamilyView : new AllFamilyView({parent: this, el: $("#view-families")})
         }
         this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
         this.views.allFamilyView.render();
      },
      render: function (evt) {
         console.log($(evt.target).data("view"));

         this.views[$(evt.target).data("view")].render();
         

      }, 
      events: { "shown #admin-tabs a": "render"}

    });

   var AddTransactionView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render");
         this.parent = this.options.parent;
         this.model = new Transaction();
         this.families = this.options.families;

         this.familyList = this.families.map(function(family) {return {name: family.get("name"), id: family.id}});
         this.familyList.unshift({name: "Secretary", id: "0"});
      },
      render: function () {
          var dateJoined = this.$(".transaction-date").parent();
         dateJoined.attr("data-date",this.model.get("transaction_date").format("MM/DD/YYYY"));
         
         dateJoined.datepicker().on("changeDate", function (evt) { 
            dateJoined.datepicker("hide");
            dateJoined.datepicker("setValue",evt.date);
         });
         Backbone.Validation.bind(this);
         this.stickit();
      },

      events: {"click #new-transaction-button": "saveTransaction"},
      saveTransaction: function(){
         console.log(this.model.attributes);
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
         ".transaction-date": { 
            observe: "transaction_date",
            onGet: function(value, options) { 
               return moment(value).format("MM/DD/YYYY");
            },
            onSet: function(value,options) { 
               //console.log(value);
               return moment(value).utc().format();
            },

            events: ['change']
         }
      }
   });

    new AdminPage({el: $("#container")});
});