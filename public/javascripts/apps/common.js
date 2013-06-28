define(['Backbone','stickit','jquery-ui'], function(Backbone){

  Backbone.Stickit.addHandler({
        selector: ".month",
        initialize: function($el, model, options) {
          $el.datepicker();
        },
        onGet: function(value, options) { return moment(value).format("MM/YYYY");},
        onSet: function(value,options) { return moment(value,"MM/YYYY"); }
    });


    Backbone.Stickit.addHandler({
        selector: ".date",
        initialize: function($el, model, options) {
          $el.datepicker();
        },
        onGet: function(value, options) { 
          return value ? moment(value).format("MM/DD/YYYY"): "" ;},
        onSet: function(value,options) { 
          return moment(value,"MM/DD/YYYY").toDate(); }
    });

    
   var common = {
      logout: function (evt) {
         evt.preventDefault();
         if (confirm('Are you sure you want to log out?')) {
            var element = $(this),
               form = $('<form></form>');
               form.attr({method: 'POST',action: '/conference-submission/sessions'})
               .hide()
               .append('<input type="hidden" />')
               .find('input')
               .attr({'name': '_method','value': 'delete'})
               .end()
               .appendTo('body')
               .submit();
            }
         return false;
        },
        getParameterByName: function(name)
        {
          name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
          var regexS = "[\\?&]" + name + "=([^&#]*)";
          var regex = new RegExp(regexS);
          var results = regex.exec(window.location.search);
          if(results == null)
            return "";
          else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    }
    return common;



    

});
