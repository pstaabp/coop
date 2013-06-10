//require config
var require = {
   paths: {
      "Backbone":             "../../components/backbone/backbone",
      "underscore":           "../../components/underscore/underscore",
      "jquery":               "../../components/jquery/jquery",
      "bootstrap":            "../../components/bootstrap/docs/assets/js/bootstrap",
      "backbone-validation":  "../../components/backbone-validation/dist/backbone-validation",
      "stickit":              "../../components/backbone.stickit/backbone.stickit",
      "jquery-ui":            "../../components/jquery-ui/ui/jquery-ui",
      "moment":               "../../components/moment/moment",

   },
   //urlArgs: "bust=" +  (new Date()).getTime(),
   waitSeconds: 15,
   shim: {
      'underscore': { exports: '_' },
      'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
      'bootstrap':['jquery'],
      'backbone-validation': ['Backbone'],
      'backbone-validation': {deps: ['Backbone', 'jquery','underscore']},
      'jquery-ui': {deps: ['jquery']},
      'stickit': {deps: ['Backbone','jquery','underscore']},
   }
};