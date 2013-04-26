module.exports = function FamilyRoutes(app, Family) {

	app.post('/coop/families', app.loadUser, function(req,res){
		var family = new Family(req.body);
   	family.save(function (err, _family) {
    		if (err) {console.log(err);}
    		res.json(_family);
  		})
	});

	app.put('/coop/families/:id?', app.loadUser, function(req,res){
		var obj = req.body;
		console.log(obj);
		var id = obj._id;
		delete obj._id;
		Family.findByIdAndUpdate(req.params.id, obj, function(err,_family){
			if(err) {console.log(err);}
			console.log(_family);
			res.json(_family);

		});
	})

	app.del('/coop/families/:id',app.loadUser,function(req,res){
		Family.findByIdAndRemove(req.params.id, function (err, family) {
      if (err) {
        console.log(err);
      } else {
        res.json({deleted: true, message: "Successfully deleted family " + family.email});
      }
    });
	})


}