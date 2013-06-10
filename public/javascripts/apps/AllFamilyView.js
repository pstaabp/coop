define(['Backbone', 'underscore','stickit'], 
function(Backbone, _){
   var AllFamilyView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render","showFamilies");
         this.parent = this.options.parent;
         this.rowTemplate = _.template($("#all-family-row-template").html());
         this.parent.families.on("remove",this.render);
         this.transactions = this.options.transactions;
      },
      render: function (){
         this.$el.html($("#family-template").html());
         this.showFamilies();
      },
      showFamilies: function () {
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
            allFamilyTable.append((new AllFamilyRowView({rowTemplate: self.rowTemplate, model: family, 
               transactions: self.transactions})).render().el);
         });
      },
      events: {"change input[type='radio']": "showFamilies"}
   });

   var AllFamilyRowView = Backbone.View.extend({
      tagName: "tr",
      initialize: function() {
         var self = this;
         _.bindAll(this,"render","deleteFamily");
         this.rowTemplate = this.options.rowTemplate;
         this.currentPoints = 0;
         var toTransactions = this.options.transactions.filter(function(trans) { return trans.get("to_family")===self.model.id;});
         var fromTransactions = this.options.transactions.filter(function(trans) { return trans.get("from_family")===self.model.id;});

         // total of the points transferred to
         var toPoints = _(toTransactions).reduce(function(num,trans) { return parseFloat(trans.get("points")) + num; },0)
         var fromPoints = _(fromTransactions).reduce(function(num,trans) { return parseFloat(trans.get("points")) + num; },0)
         this.currentPoints = parseInt(this.model.get("starting_points"))+toPoints-fromPoints; 

      },
      render: function() {
         var self = this;
         this.$el.html(this.rowTemplate);
         
         this.$(".date-joined").datepicker();
         this.$(".current-points").text(this.currentPoints);
         this.stickit();
         return this;
      },
      bindings: {
         ".active": "active",
         ".name": "name",
         ".current-points": {onSet: function () { 
            return this.currentPoints
         }},
         ".email": "email",
         ".parents": "parents", 
         ".children": "children",
         ".starting-points": "starting_points",
         ".date-joined": {observe: "date_joined",
            onGet: function(value, options) { return moment(value).format("MM/DD/YYYY");},
            onSet: function(value, options) { return moment(value).toDate();;},
            events: ['blur']
         }
      },
      events: {"click span.add-on": "showDatepicker",
               "click .delete-family": "deleteFamily",
               "click .edit-family": "editFamily",
               "click .save-family": "saveFamily"
            },
      showDatepicker: function (){
         this.$(".date-joined").datepicker("show");
      },
      deleteFamily: function(){
         var del = confirm("Do you want to delete the " + this.model.get("name") + " family");
         if(del){
            this.model.destroy();
         }
      },
      editFamily: function() {
         if (this.editable) { return; }
         this.toggleEditable();
       },
      toggleEditable: function () {
         //this.$("").prop("disabled",this.editable);
         this.$(".editable").prop("contenteditable", !this.editable);
         this.$(".transaction-date").datepicker("option", {disabled: this.editable});
         this.stickit();
         this.editable = !this.editable;
       },
   });

   return AllFamilyView;

});