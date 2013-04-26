// users routes


module.exports = function UserRoutes(app, User) {

 
	app.get('/coop/users/new',function(req, res) {
	  res.render('users/new.jade');
	}); 

	app.get('/coop/users',function(req, res){

	  console.log("in get /users");
	  console.log(req.body);

	  var query = User.find();

	  query.exec(function(err,users) {
	    // 'users' will contain all of the users returned by the query

	    if (err) return handleError(err);
	    
	    res.json(users);
	  });
	});

	app.post('/coop/users/exists',function(req,res){
  		User.findOne({email: req.body.email},function(err,_user){
		    if (err){
		      	console.log(err);
		    }
		    if (_user){
		      	res.json({user_exists: true});
		    } else {
		      	res.json({user_exists: false});
		    }
	    });
	});

	app.post('/coop/users/add', function(request, response){

  		var newUser = new User({email: request.body.email, password: request.body.password, role: request.body.role, reset_pass: false});
  
  		function userSaveFailed() {
    		response.render('users/new.jade', {
		      locals: { user: user }
	    	});
		}

		newUser.save(function(err, _user) {
    		if (err){console.log(err);}
   
		    console.log("saved!!");
		    console.log(_user);


		    response.redirect("/coop/sessions/new");

	    });
	});

}

   
