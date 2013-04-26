define(['Backbone', 'underscore'], function(Backbone, _){
    /**
     *
     * This defines a Setting
     * 
     * @type {*}
     */

    var Setting = Backbone.Model.extend({
        defaults: {
            name: "",
            value: "",
            description: ""
        },
        idAttribute: "_id"
    });

    return Setting;
});
