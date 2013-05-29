//require config
var require = {
   paths: {
      "Backbone":             "../backbone",
      "underscore":           "../underscore-min",
      "jquery":               "../jquery",
      "bootstrap":            "../bootstrap.min",
      "backbone-validation":  "../backbone-validation.min",
      "stickit":              "../backbone.stickit",
      "bootstrap-datepicker": "../bootstrap-datepicker",
      "moment":               "../moment"
   },
   urlArgs: "bust=" +  (new Date()).getTime(),
   waitSeconds: 15,
   shim: {
      'underscore': { exports: '_' },
      'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
      'bootstrap':['jquery'],
      'backbone-validation': ['Backbone'],
      'backbone-validation': {deps: ['Backbone', 'jquery','underscore']},
      'bootstrap-datepicker': {deps: ['bootstrap']},
      'stickit': {deps: ['Backbone','jquery','underscore']},
   }
};