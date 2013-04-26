//require config
require.config({
   paths: {
      "Backbone":             "../backbone",
      "underscore":           "../underscore-min",
      "jquery":               "../jquery",
      "bootstrap":            "../bootstrap.min",
      "XDate":                "../xdate",
      "backbone-validation":  "../backbone-validation.min",
      "stickit":              "../backbone.stickit",
      "bootstrap-datepicker": "../bootstrap-datepicker"
   },
   urlArgs: "bust=" +  (new Date()).getTime(),
   waitSeconds: 15,
   shim: {
      'underscore': { exports: '_' },
      'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
      'bootstrap':['jquery'],
      'backbone-validation': ['Backbone'],
      'XDate':{ exports: 'XDate'},
      'backbone-validation': {deps: ['Backbone', 'jquery','underscore']},
      'bootstrap-datepicker': {deps: ['bootstrap']},
      'stickit': {deps: ['Backbone','jquery','underscore']},
   }
});

require(['globals', 'Backbone', 'underscore','../views/WebPage','../models/Family','../models/FamilyList','../models/TransactionList', 
         '../models/Transaction','./common','XDate','bootstrap','stickit','backbone-validation','bootstrap-datepicker'],
function(globals, Backbone, _, WebPage, Family, FamilyList, TranasactionList, Transaction,common, XDate){

   var AdminPage = WebPage.extend({
      initialize: function () {
         this.constructor.__super__.initialize.apply(this, {el: this.el});
         _.bindAll(this,"render");
         
         $("#logout").on("click",common.logout);

         this.families = (globals.families)? new FamilyList(globals.families) : new FamilyList(); 

         this.addTransactionView = new AddTransactionView({parent: this, el: $("#new-transaction")});
         this.addFamilyView = new AddFamilyView({parent: this, el: $("#add-family")});
         this.allFamilyView = new AllFamilyView({parent: this, el: $("#view-families")});
         this.render();
      },
      render: function () {
         this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 

         this.addTransactionView.render();
         this.addFamilyView.render();
         this.allFamilyView.render();


      }
    });

   var AddTransactionView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render");
         this.parent = this.options.parent;
         this.model = new Transaction();
      },
      render: function () {
         var dateJoined = $("#trans-date");
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
            observe: 'from',
            selectOptions: {
              collection: 'this.parent.families',
              labelPath: 'name',
              valuePath: 'name',
              defaultOption: {label: "Choose one...", value: null}
            }
         },
         'select#family-to': {
            observe: 'to',
            selectOptions: {
              collection: 'this.parent.families',
              labelPath: 'name',
              valuePath: 'name',
              defaultOption: {label: "Choose one...", value: null}
            }
         },
         "#points": "points",
         "#trans-date": { 
            observe: "date",
            onSet: function(value, options) { return new Date(value);}, 
            events: ['changeDate']
         }
      }
   });

   var AllFamilyView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render");
         this.parent = this.options.parent;
         this.rowTemplate = _.template($("#all-family-row-template").html());
         this.parent.families.on("remove",this.render);
      },
      render: function (){
         var self = this;

         // determine what view is selected

         var whichFamilies = this.$("input[type='radio']:checked").val()
           , selectedFamilies;

         switch(whichFamilies){
            case "active": selectedFamilies = this.parent.families.filter(function(family) { return family.get("active") === true});
            break;
            case "inactive": selectedFamilies = this.parent.families.filter(function(family) { return family.get("active") === false});
            break;
            case "all": selectedFamilies = this.parent.families.filter(function(family) { return true});
            break;
         }

         var allFamilyTable  = this.$("#allFamilyTable tbody");
         allFamilyTable.html("");
         _(selectedFamilies).each(function(family){ 
            allFamilyTable.append((new AllFamilyRowView({rowTemplate: self.rowTemplate, model: family})).render().el);
         });
      },
      events: {"change input[type='radio']": "render"}
   });

   var AllFamilyRowView = Backbone.View.extend({
      tagName: "tr",
      initialize: function() {
         var self = this;
         _.bindAll(this,"render","deleteFamily","save");
         this.rowTemplate = this.options.rowTemplate;
         this.model.on("change:date_joined", function(model){
            console.log(model.attributes);
            //model.set({date_joined: }, {silent: true})
            self.model.save();
         })
      },
      render: function() {
         var self = this;
         this.$el.html(this.rowTemplate);
         
         var dateJoined = this.$(".date-joined input");
         dateJoined.datepicker().on("changeDate", function (evt) { 
            dateJoined.datepicker("hide");
            dateJoined.datepicker("setValue",(new XDate(evt.date)).toString("MM/dd/yyyy"));
         });
         this.stickit();
         return this;
      },
      bindings: {
         ".active": "active",
         ".name": "name",
         ".email": "email",
         ".parents": "parents", 
         ".children": "children",
         ".starting-points": "starting_points",
         ".date-joined input": {observe: "date_joined",
            onGet: function(value, options) { return (new XDate(value)).toString("MM/dd/yyyy");},
            onSet: function(value,options) { return new XDate(value).toISOString();},
            events: ['changeDate']
         }
      },
      events: {"click span.add-on": "showDatepicker",
               "click .delete-family": "deleteFamily",
               "blur td.editable": "save"
            },
      save: function (evt) {
         this.model.save();
      },
      showDatepicker: function (){
         this.$(".date-joined input").datepicker("show");
      },
      deleteFamily: function(){
         var del = confirm("Do you want to delete the " + this.model.get("name") + " family");
         if(del){
            this.model.destroy();
         }
      }
   });

   var AddFamilyView = Backbone.View.extend({
      initialize: function (){
         var self = this; 
         _.bindAll(this,"render");
         
         this.model = new Family();
         this.model.bind('validated:invalid', function(model, errors) {
           var selectors = _(self.bindings).invert();
            _(errors).chain().keys().each(function(key) {
                  if(_.isObject(key)){
                     key = key.observe;
                  }
                  self.errorPane.addMessage(errors[key]); 
                  console.log(selectors[key]);
                  this.$(selectors[key]).css("background-color","pink");
               });

           console.log(errors);
           console.log(model);
         });

         this.model.on("update", function(model){
            console.log(model);
         })
      },
      render: function (){
         var self = this;
         this.errorPane = this.options.parent.errorPane;
         var dateJoined = $("#date-joined");
         dateJoined.datepicker().on("changeDate", function (evt) { 
            dateJoined.datepicker("hide");
            dateJoined.datepicker("setValue",evt.date);
         });
         Backbone.Validation.bind(this);
         this.stickit();
      },
      bindings: {
         "#name":  "name",
         "#email": "email",
         "#parents": "parents",
         "#children": "children",
         "#starting-points": "starting_points",
         "#date-joined": { 
            observe: "date_joined",
            onSet: function(value, options) { return new Date(value);}, 
            events: ['changeDate']
         }
      },
      events: {"click button#add-family-button": "addFamily"},
      addFamily: function () {
         this.model.save();
      },
   });

    new AdminPage({el: $("#container")});
});