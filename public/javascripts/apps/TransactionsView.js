define(['Backbone','underscore','moment','../models/Transaction','../models/TransactionFilter',
      'editablegrid','common', 'jstorage','jquery-ui' /*,'editablegrid-utils'*/],
  function(Backbone,_,moment,Transaction,TransactionFilter,EditableGrid,common){
	
 var TransactionsView = Backbone.View.extend({
      initialize: function (){
         var self = this; 
         _.bindAll(this,"render","filter","filterTransactions","updatePoints","customizeGrid",
                        "gridChanged","updateGrid","filterAndUpdate");
         this.transactions = this.options.transactions;
         this.settings = this.options.settings;
         this.rowTemplate = $("#transaction-row-template").html();
         this.families = this.options.families;
         this.familyList = [];
         this.familyList["0"]="Secretary";
         this.families.each(function(family){ self.familyList[family.id] = family.get("name");});
         
         this.transactions.on("remove",this.filterAndUpdate);
         this.transactions.on("add",this.filterAndUpdate);
         this.transactions.on("change",this.filterAndUpdate);
         this.filteredTransactions = this.transactions.filter(function(trans){ return true;});
         
         this.model = new TransactionFilter(JSON.parse($.jStorage.get("filterSettings"))); 
         this.model.on("change",this.filterTransactions);
         this.grid = new EditableGrid("TransactionGrid", {enableSort: true});
        
         this.tableHeaders = common.transactionTableHeaders;
         this.tableHeaders[1].values=this.familyList;
         this.tableHeaders[2].values=this.familyList;
         
         this.grid.modelChanged = this.gridChanged; 
         this.grid.load({metadata: this.tableHeaders, data: [{}]});
         this.customizeGrid();
         //this.loadFilterSettings();
         
      },
      render: function(){
      	this.$el.html($("#all-transactions-template").html());
         this.grid.renderGrid("transaction-table-container", "table table-bordered table-condensed", "transaction-table");
         //this.renderFilterSettings();
         this.filterTransactions();
         this.updateGrid();
           
         this.stickit();
      },
      filterAndUpdate: function () {
         this.filterTransactions();
         this.updateGrid();
      },
      updateGrid: function () {
        var _data = this.filteredTransactions.map(function(_trans){ return {id: _trans.cid, values: _trans.attributes}}); 
        this.grid.load({data: _data});
        this.grid.refreshGrid();
      },
      gridChanged: function(row,col,oldValue,newValue){
         if ((col==0)&&(newValue==="delete")){
            var _trans = this.transactions.get(this.grid.getRowId(row));   
            var conf = confirm("Do you wish to delete the transaction on " + moment(_trans.get("transaction_date")).format("MM/DD/YYYY") + "?");
            if (conf){
               _trans.destroy();
            }
         } else {
            this.transactions.get(this.grid.getRowId(row)).set(this.grid.getColumnName(col),newValue).save();
         }


      },
      filterTransactions: function () {
        var self = this
          , type = this.model.get("filter_type");

        this.model.set("filter_type",type);
      	switch(type){
          case "all":
            this.filteredTransactions = this.transactions.filter(function(trans){ return true;});
            break;
         	case "month": 
         		this.filteredTransactions = this.transactions.filter(function(trans){
         			return moment(trans.get("transaction_date")).isSame(self.model.get("month"),"month");
	         	});
         	break;
         	case "timespan":
            this.filteredTransactions = this.transactions.filter(function(trans){
              return moment(self.model.get("from_date")).startOf("day").isBefore(moment(trans.get("transaction_date"))) &&
                  moment(trans.get("transaction_date")).isBefore(moment(self.model.get("to_date")).endOf("day"));
                });
          break;
         }
         $.jStorage.set("filterSettings",JSON.stringify(this.model.attributes));
         this.updateGrid();
         this.updatePoints();
         this.stickit();
      },
      updatePoints: function () {
        var self = this;
      	var totalPoints = _(_(_.range(this.grid.getRowCount())).map(function(row) {return self.transactions.get(self.grid.getRowId(row)).get("points");})).reduce(function(num,pts){ return pts+num;}, 0);
      	this.$(".transaction-totals").html("Total number of points transferred is " + totalPoints);
      },
      filter: function(evt){
        this.grid.filter($(evt.target).val());
        this.updatePoints();
      },
      clearFilter: function () {
        this.$(".filter-text").val("");
        this.grid.filter("");
        this.updatePoints();
      },
      bindings: { ".month-view": "month",
                  ".from-time": "from_date",
                  ".to-time": "to_date",
                  "input[name='trans-view']": "filter_type"
        },
      events: { "keyup .filter-text": "filter",
                "click .clear-filter": "clearFilter",
                "click .new-trans-button": "showNewTransaction"
             }, 
      
      showNewTransaction: function () {
        this.$(".new-transaction").html("").append(
            (new AddTransactionView({settings: this.settings, families: this.families, 
                    transactions: this.transactions})).render().el);
        this.$(".new-transaction").show({duration: 600, effect: "blind", direction: "up"});
      },
      customizeGrid: function () {
         var self = this;
         this.grid.setCellRenderer("transaction_date", common.dateCellRenderer);
         this.grid.setCellRenderer("Delete",common.deleteCellRenderer);
         this.grid.setCellEditor("transaction_date",common.dateCellEditor);
         this.grid.clearCellValidators("transaction_date");
      }

   });

  var AddTransactionView = Backbone.View.extend({
      initialize: function() {
         _.bindAll(this,"render","cancelTransaction","saveTransaction");
         this.settings = this.options.settings; 

         this.currentDate = this.settings.find(function(_setting) {return _setting.get("name")=="currentDate"}).get("value")
         this.model = new Transaction({transaction_date: this.currentDate});
         this.families = this.options.families;
         this.transactions = this.options.transactions;
         
         var currDate = moment(this.currentDate);

         this.familyList = _(this.families.filter(function(family) { return family.isActive(currDate);}))
                                 .map(function(family) {return {name: family.get("name"), id: family.id}});
         this.familyList.unshift({name: "Secretary", id: "0"});
      },
      render: function () {
        this.$el.html($("#new-transaction-template").html());
         this.$(".transaction-date").datepicker();
         this.stickit();
         return this;
      },

      events: {"click .save-transaction-button": "saveTransaction",
               "click .cancel-transaction-button": "cancelTransaction"},
      cancelTransaction: function(){
         this.$el.hide({duration: 600, effect: "blind", direction: "up"});
      },
      saveTransaction: function(){
        var self = this;
         // save the transaction and then create an empty one. 
         this.model.save(this.model.attributes,{success: function (model, response, options){
            self.transactions.add(model);
            self.cancelTransaction();
         }});
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
         ".transaction-date": "transaction_date"
      }
   }); 



return TransactionsView;

});

