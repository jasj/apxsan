var raise = function(req,res,err){
	res.json({"status" : 506});
	console.log(err);
	errorReporter.log({"method":"getServicesByProduct", "error":err});
}

exports.raise = raise;