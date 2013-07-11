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
      "jstorage":             "../../components/jstorage/jstorage",
      "editablegrid":         "../../components/editablegrid/editablegrid-2.0.1/editablegrid-2.0.1",
      // "editablegrid":         "../../javascripts/editablegrid/editablegrid",
      // "editablegrid-editors": "../../javascripts/editablegrid/editablegrid_editors",
      // "editablegrid-renderers": "../../javascripts/editablegrid/editablegrid_renderers",
      // "editablegrid-utils":   "../../javascripts/editablegrid/editablegrid_utils",
      // "editablegrid-validators": "../../javascripts/editablegrid/editablegrid_validators",
      "monthpicker":          "../../components/monthpicker/jquery.mtz.monthpicker"

   },
   //urlArgs: "bust=" +  (new Date()).getTime(),
   waitSeconds: 15,
   shim: {
      'underscore':           {exports: '_' },
      'Backbone':             {deps: ['underscore', 'jquery'], exports: 'Backbone'},
      'bootstrap':            {deps: ['jquery']},
      'backbone-validation':  {deps: ['Backbone', 'jquery','underscore']},
      'jquery-ui':            {deps: ['jquery']},
      'stickit':              {deps: ['Backbone','jquery','underscore']},
      'jstorage':             {deps: ['jquery']},
      'editablegrid':          {deps: ['jquery'], exports: 'EditableGrid'},
      // 'editablegrid':         {deps: ['jquery','editablegrid-editors','editablegrid-renderers','editablegrid-validators'], exports: "EditableGrid"},
      // 'editablegrid-utils':   {deps: ['editablegrid']},
      'monthpicker':          {deps: ['jquery-ui']}
   }
};