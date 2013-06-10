module.exports = function TransactionsRoutes(app, Transaction) {

	app.post('/coop/transactions', app.loadUser, function(req,res){
		var transaction = new Transaction(req.body);

		console.log(req.body);

   	transaction.save(function (err, _transaction) {
    		if (err) {console.log(err);}
    		res.json(_transaction);
  		})
	});

	app.put('/coop/transactions/:id?', app.loadUser, function(req,res){
		var obj = req.body;
		console.log(obj);
		var id = obj._id;
		delete obj._id;
		Transaction.findByIdAndUpdate(req.params.id, obj, function(err,_transaction){
			if(err) {console.log(err);}
			console.log(_transaction);
			res.json(_transaction);

		});
	})

	app.del('/coop/transactions/:id',app.loadUser,function(req,res){
		
		Transaction.findByIdAndRemove(req.params.id, function (err, transaction) {
      if (err) {
        console.log(err);
      } else {
        res.json({deleted: true, message: "Successfully deleted transaction "});
      }
    });
	})


}