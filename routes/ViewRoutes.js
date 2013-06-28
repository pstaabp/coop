module.exports = function ViewRoutes(app, User,Family,Transaction,Setting,_und) {

	app.get('/coop/view', app.loadUser, function(req,res){
		
		Family.find({}).exec(function(err,_families){
			if(err){console.log(err);}

			Transaction.find({}).exec(function(err2,_transactions){
				if(err2){console.log(err2);}

				Setting.find({}).exec(function(err3,_settings){
					if(err3){console.log(err3);}
					res.render('admin.jade',{families: _families,transactions:_transactions,settings: _settings});							
				})


			});


		})

	});

}