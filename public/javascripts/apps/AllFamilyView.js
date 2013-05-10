define(['Backbone', 'underscore'], 
function(Backbone, _){
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
            dateJoined.datepicker("setValue",moment(evt.date).format("MM/DD/YYYY"));
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
            onGet: function(value, options) { return moment(value).format("MM/DD/YYYY");},
            onSet: function(value,options) { return moment(value).utc().format();;},
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

   return AllFamilyView;

});