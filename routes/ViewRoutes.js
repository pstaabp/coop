module.exports = function ViewRoutes(app, User,Family,_und) {

	app.get('/coop/view', app.loadUser, function(req,res){
		
		Family.find({}).exec(function(err,_families){
			if(err){console.log(err);}

			res.render('admin.jade',{families: _families});			
		})

	});

}