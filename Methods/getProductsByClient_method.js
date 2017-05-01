/*
		Appriz mobile 2014
		Service: sendServiceRequest
*/

/*--------------------------------------------------------------------------/
	Description:
	Get  products of a client
---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
getProductsByClient = function(req,res){
	console.log('getProductsByClient');
	try{
		var v = new Validator();
		v.addSchema(objectClientId, '/SchemaobjectClientId');
		//Test if the request is valid
		var errors = v.validate(req.body, objectClientId).errors;
		if(errors.length==0){
			var Id = JSON.parse(cryptools.decrypt(req.body.idSecretClient, { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_jasj", signAlgorithm: "sha1", signed: true })).identification;
			
			var connection = new sql.Connection(Config.DB_CONFIG, function(err) {
				if(err){error.raise(req,res,err); return 1;}
				//Create the appriz-client on the DB
					var request = new sql.Request(connection);
						request.input('Identification', sql.VarChar(50), Id);
						request.input('Entity', sql.VarChar(50), Config.ENTITY_NAME);
						
						request.execute('PM_getProductsWithRulesByClient', function(err, recordsets, returnValue) {
							if(err){error.raise(req,res,err); return 1;}
							console.log('PM_getProductsWithRulesByClient');
							var dataHolder = {};
							recordsets[0].forEach(function(value,index){
								dataHolder[value['Producto']]= value['TipoProducto']; 
								
							});
							res.json({"status" : 200, "products":dataHolder});
						});
				});
			
		}else{
			res.json({
				"status" : 452,
				"errors" : errors
			});console.log("452:"+errors);
		}
}catch(error){
	res.json({"status" : 506});
	errorReporter.log({"method":"getProductsByClient", "error":error});
	console.log("506:"+error);
	
}
	
	
}