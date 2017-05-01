/*
		Appriz mobile 2014
		Service: getTimePeriods
*/

/*--------------------------------------------------------------------------/
	Description:
	Get all periods defined by the entity
---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
getTimePeriods = function(req,res){
console.log('getTimePeriods');
	try{
		var v = new Validator();
		v.addSchema(objectSecretKey, '/SchemaSecretKey');
		//Test if the request is valid
		var errors = v.validate(req.body, objectSecretKey).errors;
		if(errors.length==0){
		//check if has authorization 
		if(req.body.secretKey == Config.IDENTITY.sessionId ){
			var connection = new sql.Connection(Config.DB_CONFIG, function(err) {
				if(err){error.raise(req,res,err); return 1;}
				var request = new sql.Request(connection);
					request.input('idEntidad', sql.Int, Config.ENTITY_ID); 
					if( "language" in req.body) {request.input('CodigoIdioma', sql.VarChar(5),req.body.language );}else{
						request.input('CodigoIdioma', sql.VarChar(3), 'en');
					}
					
					request.execute('CONSP_ObtenerPeriodoTiempoXEntidad', function(err, recordsets, returnValue) {
					console.log('CONSP_ObtenerPeriodoTiempoXEntidad');
					if(err){error.raise(req,res,err); return 1;} else{
					 
					var dataHolder = [];
					
					recordsets[0].forEach(function(value,index){
						dataHolder.push({"idTime":value['IdPeriodoTiempo'],"amount": value['CantidadTiempo'],"unit" : value['Descripcion']});
					});
					
					console.log('a');
					res.json({"status" : 200,"periods":dataHolder});
				}});
			});
		}else{console.log('c');res.json({"status" : 401});}
		
		}else{
			console.log('b');
				res.json({
					"status" : 452,
					"errors" : errors
				});
		}
}catch(error){console.log('d');
	res.json({"status" : 506});
	errorReporter.log({"method":"getTimePeriods", "error":error});
}

}