//require config
require.config({
    paths: {
        "Backbone":             "../backbone-min",
        "underscore":           "../underscore-min",
        "jquery":               "../jquery.min",
        "bootstrap":            "../bootstrap.min",
        "XDate":                "../xdate",
    },
    urlArgs: "bust=" +  (new Date()).getTime(),
    waitSeconds: 15,
    shim: {
        'underscore': { exports: '_' },
        'Backbone': { deps: ['underscore', 'jquery'], exports: 'Backbone'},
        'bootstrap':['jquery'],
        'XDate':{ exports: 'XDate'},
    }
});

require(['Backbone', 'underscore','../models/UserList','../models/User','../views/WebPage'],
function(Backbone, _,UserList, User, WebPage, common){ 

    var NewUserPage = WebPage.extend({ 
        initialize: function () {
            this.constructor.__super__.initialize.apply(this, {el: this.el});
            _.bindAll(this, 'render','fetchSuccess');  // include all functions that need the this object
            var self = this;

            this.users = new UserList();
            this.users.fetch({success: this.fetchSuccess});
        },
        render: function(){
             this.constructor.__super__.render.apply(this);  // Call  WebPage.render(); 
            this.$el.append(_.template($("#new-user-view").html()));
        },
        events: {"click #submit": "submit"},
        fetchSuccess: function(collection, response, options) {
            this.render();
        },
        submit: function(){
            var self = this;
            $("#submit").prop("disabled",true);
            var _email = $("input[name='temail']").val();
            var pass = $("input[name='tpassword']").val();
            var verify = $("input[name='tverify']").val();

            if (pass!==verify){
                alert("The two passwords must match.");
                $("button#submit").prop("disabled",false);
                return false;
            } else if (pass.length<6){
                alert("Please enter a password at least 6 characters in length");
                $("button#submit").prop("disabled",false);
                return false;
            } 

            $.post("/coop/users/exists", {email: _email}, function (data){
                if (data.user_exists){
                    self.errorPane.addMessage("The email " + _email + " has already been used.  Click 'forget my password' if you need to.");
                    $("#submit").prop("disabled",false);
                } else {
                    $("input[name='email']").val(_email);
                    $("input[name='password']").val(pass);
                    $("input[name='role']").val("");

                    self.announce.addMessage("You have successfully created a new account.  You will be redirected to login with " +
                        "this account information in 5 seconds.");
                    window.setTimeout(function () {document.getElementById("newUser").submit();}, 5000); 
                    
                }
            });
        }
    });
    
    new NewUserPage({el: $("#container")});
});
