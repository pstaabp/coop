define(['Backbone', 'underscore','../models/Family','common','../views/Closeable', 'stickit','backbone-validation'], 
function(Backbone, _,Family, common, Closeable){
   var FamilyView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render","showFamilies","customizeGrid","gridChanged","addNewFamily");
         
         this.families = this.options.families;
         this.families.on("remove",this.showFamilies);
         this.families.on("add",this.showFamilies);
         this.transactions = this.options.transactions;
         this.settings = this.options.settings;
         this.grid = new EditableGrid("TransactionGrid", {enableSort: true, dateFormat: "US"});         
         this.grid.modelChanged = this.gridChanged; 
         this.grid.load({metadata: common.familyTableHeaders, data: [{}]});
         this.customizeGrid();
    
      },
      render: function (){
         var self = this;
         this.$el.html($("#family-template").html());
         this.grid.renderGrid("family-table-container", "table table-bordered table-condensed", "family-table");
         
         this.currentDateProp = (this.settings.find(function(_setting){return _setting.get("name") === "currentDate" ;}));
         this.currentDateProp.on("change",this.showFamilies);
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
               selectedFamilies = this.families.filter(function(family) { return family.isActive(currentDate);});
            break;
            case "inactive": 
               selectedFamilies = this.families.filter(function(family) { return ! family.isActive(currentDate);});
            break;
            case "all": selectedFamilies = this.families.filter(function(family) { return true});
            break;
         }

         var _data = _(selectedFamilies).map(function(family){
            var toTransactions = self.transactions.filter(function(trans) { 
               return trans.get("to_family")===family.id && moment(trans.get("transaction_date")).startOf("day").isBefore(currentDate);});
            var fromTransactions = self.transactions.filter(function(trans) { 
               return trans.get("from_family")===family.id&& moment(trans.get("transaction_date")).startOf("day").isBefore(currentDate);});
            var toPoints = _(toTransactions).reduce(function(num,trans) { return parseFloat(trans.get("points")) + num; },0)
            var fromPoints = _(fromTransactions).reduce(function(num,trans) { return parseFloat(trans.get("points")) + num; },0);
            var _values = _.clone(family.attributes);
            _.extend(_values,{current_points : parseInt(family.get("starting_points"))+toPoints-fromPoints});
            return {id: family.cid, values: _values}
         })

         this.grid.load({data: _data});
         this.grid.refreshGrid();
      },
      events: {"change input[type='radio']": "showFamilies",
               "click .new-family-button" : "addNewFamily",
               "click .save-current-date": "saveCurrentDate"
            },
      bindings: { ".current-date": "value"},
      customizeGrid: function () {
         this.grid.setCellRenderer("Delete",common.deleteCellRenderer,{action: "delete"});
         /*this.grid.setCellRenderer("date_joined",common.dateCellRenderer);
         this.grid.setCellRenderer("date_left", common.dateCellRenderer);
         this.grid.setCellEditor("date_joined",common.dateCellEditor);
         this.grid.clearCellValidators("date_joined");
         this.grid.setCellEditor("date_left",common.dateCellEditor);
         this.grid.clearCellValidators("date_left"); */


      },
      gridChanged: function(row,col,oldValue,newValue){
         var _family = this.families.get(this.grid.getRowId(row));    
         if ((col==0)&&(newValue==="delete")){
            
            var conf = confirm("Do you wish to delete the " + _family.get("name") + "?");
            if (conf){
               _family.destroy();
            }
         } else {
            _family.set(this.grid.getColumnName(col),newValue).save();
         }
      },
      addNewFamily: function () {
         this.$(".new-family").html("").append(
            (new AddFamilyView({settings: this.settings, families: this.families, 
                    transactions: this.transactions})).render().el);
         this.$(".new-family").show({duration: 600, effect: "blind", direction: "up"});
         $(".transaction-date").focus();
      },
      saveCurrentDate: function () {
         this.currentDateProp.save();
      }
      
   });

var AddFamilyView = Backbone.View.extend({
      initialize: function (){
         var self = this; 
         _.bindAll(this,"render");
         this.families = this.options.families; 
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

      },
      render: function (){
         this.$el.html("");
         this.$el.append((new Closeable({classes: "error"})).render().el);
         this.$el.append($("#add-family-template").html());

         //this.$(".date-joined").datepicker();
         Backbone.Validation.bind(this);
         this.stickit();
         return this;
      },
      bindings: {
         ".name":  "name",
         ".email": "email",
         ".parents": "parents",
         ".children": "children",
         ".starting-points": "starting_points",
         ".date-joined": "date_joined"
      },
      events: {"click button.add-family-button": "addFamily",
               "click button.cancel-add-family-button": "cancel"},
      addFamily: function () {
         this.families.add(this.model);
         this.model.save();
         this.cancel();
      },
      cancel: function(){
         this.$el.hide({duration: 600, effect: "blind", direction: "up"});
      },
   });



   return FamilyView;

});