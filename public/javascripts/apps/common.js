define(['Backbone','stickit','jquery-ui','monthpicker','editablegrid'], function(Backbone){

  Backbone.Stickit.addHandler({
        selector: ".month",
        initialize: function($el, model, options) {
          $el.monthpicker({selectedYear: moment(model.get("month")).year()});
        },
        onGet: function(value, options) { 
          return moment(value).format("MM/YYYY");},
        onSet: function(value,options) { 
          return moment(value,"MM/YYYY").add(1,"days"); }
    });


    Backbone.Stickit.addHandler({
        selector: ".date",
        initialize: function($el, model, options) {
          $el.datepicker({formatDate:"mm/dd/yy"})
        },
/*        onGet: function(value, options) { 
          return value ? moment(value).format("MM/DD/YYYY"): "" ;},
        onSet: function(value,options) { 
          return value; }, */
    });

    // sets up to edit dates correctly inside an editable grid

    function DateEditor(config) { this.init(config);}

    DateEditor.prototype = new TextCellEditor();
    DateEditor.prototype.displayEditor = function(element,htmlInput) {
      TextCellEditor.prototype.displayEditor.call(this,element,htmlInput);
      var currDate = $(htmlInput).val() ? moment($(htmlInput).val()).format("MM/DD/YYYY"):"";
      $(htmlInput).val(currDate).datepicker({beforeShow: function () {
            this.onblur_backup = this.onblur;
            this.onblur = null;
          },
            onClose: function(dateText){
              if (dateText != '') {
                this.celleditor.applyEditing(htmlInput.element, moment(dateText,"MM/DD/YYYY").toDate());
              } else if (this.onblur_backup != null) {this.onblur_backup();}
            }
        }).datepicker("show");
    }

    function DeleteCellRenderer(config) {
      this.init(config);
    }

    DeleteCellRenderer.prototype = new CellRenderer();
    DeleteCellRenderer.prototype.render  = function(_cell,_value){
              $(_cell).html("<button class='btn btn-small'><i class='icon-trash'></i></button>")
                  .on("click", {obj: this, cell: _cell, value: _value}, this.deleteRow); };

    DeleteCellRenderer.prototype.deleteRow = function(evt) {
      var row =  evt.data.obj.editablegrid.getRowIndex($(evt.data.cell).parent().attr("id").split("_")[1]);
      evt.data.obj.editablegrid.modelChanged.call(evt.data.obj.editablegrid,row,0,"","delete")

                  };

    
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
        },
        transactionTableHeaders: [
                {name: "Delete", datatype: "string", editable: false},
                {label: "Points From", datatype: "string", name: "from_family",  editable: true},
                {label: "Points To", name: "to_family",  datatype: "string",editable: true},
                {label: "Points", name: "points", datatype: "number", editable: true},
                {label: "Date", name: "transaction_date", datatype: "date",editable: true}],
        familyTableHeaders: [
          {name: "Delete", datatype: "string", editable: false},
          {label: "Family Name", name: "name", editable: true},
          {label: "Parents", name: "parents", editable: true},
          {label: "Children", name: "children", editable: true},
          {label: "Current Points", name: "current_points", editable: false},
          {label: "Email", name: "email", editable: true},
          {label: "Date Joined", name: "date_joined", datatype: "date", editable: true},
          {label: "Date Left", name: "date_left", datatype: "date", editable: true},
          {label: "Starting Points", name: "starting_points", editable: false},
        ],
        deleteCellRenderer: new DeleteCellRenderer(),
        dateCellRenderer: new CellRenderer({
            render: function (cell, value){
              var output = value ? moment(value).format("MM/DD/YYYY") : "";
              $(cell).html(output).addClass("date");
            }
        }),
        dateCellEditor:  new DateEditor()
        


    }
    return common;




    

});
