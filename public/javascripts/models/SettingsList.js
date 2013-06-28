define(['Backbone', 'underscore','./Setting'], function(Backbone, _,Setting){
    /**
     *
     * This defines a User
     * 
     * @type {*}
     */

    var SettingsList = Backbone.Collection.extend({
        model: Setting,
        url: '/coop/settings',
    });

    return SettingsList;

});
