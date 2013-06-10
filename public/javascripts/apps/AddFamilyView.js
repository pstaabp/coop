define(['Backbone', 'underscore','../models/Family','jquery-ui','backbone-validation'], 
function(Backbone, _,Family){

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
         var self = this;
         this.errorPane = this.options.parent.errorPane;

         this.$(".date-joined").datepicker();
         Backbone.Validation.bind(this);
         this.stickit();
      },
      bindings: {
         ".name":  "name",
         ".email": "email",
         ".parents": "parents",
         ".children": "children",
         ".starting-points": "starting_points",
         ".date-joined": { 
            observe: "date_joined",
            onGet: function(value, options) { 
               return moment(value).format("MM/DD/YYYY");
            },
            onSet: function(value,options) { 
               return moment(value).utc().format();
            },

            events: ['changeDate']
         }
      },
      events: {"click button#add-family-button": "addFamily"},
      addFamily: function () {
         this.families.add(this.model);
         this.model.save();
         this.model = new Family();
         this.render();
      },
   });

	return AddFamilyView;

});