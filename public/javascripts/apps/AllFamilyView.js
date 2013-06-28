define(['Backbone', 'underscore','stickit'], 
function(Backbone, _){
   var AllFamilyView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render","showFamilies","testme");
         
         this.rowTemplate = _.template($("#all-family-row-template").html());
         this.families = this.options.families;
         this.families.on("remove",this.render);
         this.transactions = this.options.transactions;
         this.settings = this.options.settings;
      },
      render: function (){
         var self = this;
         this.$el.html($("#family-template").html());
         this.currentDateProp = (this.settings.find(function(_setting){return _setting.get("name") === "currentDate" ;}));
         this.currentDateProp.on("change",this.render);
         if (this.currentDateProp.get("value")== "") {this.currentDateProp.set("value",moment().format("MM/DD/YYYY"));}
         this.showFamilies();
         this.stickit(this.currentDateProp);
      },
      showFamilies: function () {
         var self = this; 
          // determine what view is selected

         var whichFamilies = this.$("input[type='radio']:checked").val()
           , selectedFamilies
           , currentDate = moment(this.currentDateProp.get("value"));

         switch(whichFamilies){
            case "active": 
               selectedFamilies = this.families.filter(function(family) { 
                  if(!family.get("date_left")) { return moment(family.get("date_joined")).isBefore(currentDate);}
                  return (moment(family.get("date_joined")).isBefore(currentDate)) &&
                           (currentDate.isBefore(moment(family.get("date_left"))));});
            break;
            case "inactive": 
               selectedFamilies = this.families.filter(function(family) { 
                  if (!family.get("date_left")) { return currentDate.isBefore(moment(family.get("date_joined")));}
                  return (currentDate.isBefore(moment(family.get("date_joined")))) ||
                           (currentDate.isAfter(moment(family.get("date_left"))));
                        });
            break;
            case "all": selectedFamilies = this.families.filter(function(family) { return true});
            break;
         }

         var allFamilyTable  = this.$("#allFamilyTable tbody");
         allFamilyTable.html("");
         _(selectedFamilies).each(function(family){ 
            allFamilyTable.append((new AllFamilyRowView({rowTemplate: self.rowTemplate, model: family, 
               transactions: self.transactions})).render().el);
         });
      },
      events: {"change input[type='radio']": "showFamilies",
               //"change .current-date" : "testme"
            },
      bindings: { ".current-date": "value"},
      testme: function () {
         console.log(this.currentDateProp.attributes);
      }
      
   });

   var AllFamilyRowView = Backbone.View.extend({
      tagName: "tr",
      initialize: function() {
         var self = this;
         _.bindAll(this,"render","deleteFamily","editFamily","saveFamily");
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
         ".date-joined": "date_joined",
         ".date-left": "date_left"
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
      saveFamily: function () {
         this.model.save();
         this.toggleEditable();
      },
      editFamily: function() {
         if (this.editable) { return; }
         this.toggleEditable();
       },
      toggleEditable: function () {
         //this.$("").prop("disabled",this.editable);
         this.$(".editable").prop("contenteditable", !this.editable);
         this.$(".date").datepicker("option", {disabled: this.editable});
         this.stickit();
         this.editable = !this.editable;
       },
   });

   return AllFamilyView;

});