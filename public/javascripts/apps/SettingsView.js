define(['Backbone','underscore','moment','../models/SettingsList'],function(Backbone,_,moment,SettingsList){
	
 var SettingsView = Backbone.View.extend({
 	initialize: function () {
 		_.bindAll(this,"render");
 		this.settings = this.options.settings;
 	},
 	render: function () {
 		var self = this;
 		this.$el.html($("#settings-template").html())
 		var settingsTable = this.$(".settings-table tbody");
 		this.settings.each(function(setting){
 			settingsTable.append((new SettingRowView({model: setting, rowTemplate: this.rowTemplate})).render().el);
 		});
 	}

 });

 var SettingRowView = Backbone.View.extend({
 	tagName: "tr",
 	initialize: function() {
 		_.bindAll(this,"render");
 		this.rowTemplate = this.options.rowTemplate;
 	},
 	render: function() {
 		this.$el.html($("#setting-row-template").html());
 		if (this.model.get("type")==="date"){

 			this.$(".value").html("<input class='span2 date value'>").removeClass("value");}

 		this.stickit();
 		return this;
 	},
 	bindings: { ".name": "name",
 				".description": "description",
 				".value": "value"}
 })




 return SettingsView;

});