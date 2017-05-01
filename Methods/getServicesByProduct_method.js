/*
		Appriz mobile 2014
		Service: sendServiceRequest
*/

/*----------------------------------------------------------------------------/
	Description:
	Get all services available for a specific product
----------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
getServicesByProduct = function(req,res){ 
	try{
	var v = new Validator();
	v.addSchema(objectByProduct, '/SchemaByProduct');
	var errors = v.validate(req.body, objectByProduct).errors;
	if(errors.length==0){
			 var Id = JSON.parse(cryptools.decrypt(req.body.idSecretClient, { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_jasj", signAlgorithm: "sha1", signed: true })).identification;
			 
			 var connection = new sql.Connection(Config.DB_CONFIG, function(err) {
				if(err){error.raise(req,res,err); return 1;}
				//Create the appriz-client on the DB
					var request = new sql.Request(connection);
						request.input('Identification', sql.NVarChar(50), Id);
						request.input('productName', sql.NVarChar(30), req.body.productName);
					
						
						request.execute('PM_getServicesByProduct', function(err, recordsets, returnValue) {
							console.log('PM_getServicesByProduct');
						
							if(err){error.raise(req,res,err); return 1;}
							
							tmp_holder = {};
						
						
								recordsets[0].forEach(function(service, index){
									tmp_holder[service['Code']] = service['Description'];
								
								});
							
							

								res.json({"status" : 200, "services": tmp_holder});
						});
			});
	}else{
		res.json({
			"status" : 452,
			"errors" : errors
		});
	}
}catch(error){
	res.json({"status" : 500});
	errorReporter.log({"method":"getServicesByProduct", "error":error});
}

}