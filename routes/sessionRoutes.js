// users routes


module.exports = function SessionRoutes(app, User) {

	app.get('/coop/sessions/new', function(req, res) {
  		res.render('sessions/new.jade', {user: new User()});
	});

	app.post('/coop/sessions', function(req, res) {
  		User.findOne({ email: req.body.user.email }, function(err, user) {
    		if (user && user.authenticate(req.body.user.password)) {
      	req.session.user_id = user.id;


      	// Remember me
      	if (req.body.remember_me) {
        		var loginToken = new LoginToken({ email: user.email });
        		loginToken.save(function() {
          		res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
        		});
        	}
        	
     		res.redirect('/coop/view');
      	
    	} else {
      	console.log("Incorrect credentials");
      	//req.flash('error', 'Incorrect credentials');
      	res.redirect('/coop/sessions/new?password-correct=false');
    	}
  }); 
});

}
