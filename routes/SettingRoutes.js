module.exports = function SettingRoutes(app, Setting) {

	app.post('/coop/settings', app.loadUser, function(req,res){
		var setting = new Setting(req.body);
   		setting.save(function (err, _setting) {
    		if (err) {console.log(err);}
    		res.json(_setting);
  		})
	});

	app.put('/coop/settings/:id?', app.loadUser, function(req,res){
		var obj = req.body;
		console.log(obj);
		var id = obj._id;
		delete obj._id;
		Setting.findByIdAndUpdate(req.params.id, obj, function(err,_setting){
			if(err) {console.log(err);}
			console.log(_setting);
			res.json(_setting);

		});
	})

	app.del('/coop/settings/:id',app.loadUser,function(req,res){
		setting.findByIdAndRemove(req.params.id, function (err, setting) {
      if (err) {
        console.log(err);
      } else {
        res.json({deleted: true, message: "Successfully deleted setting " + setting.name});
      }
    });
	})


}