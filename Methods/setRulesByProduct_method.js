/*
		Appriz mobile 2014
		Service: setRulesByProduct
*/

/*--------------------------------------------------------------------------/
	Description:
	Set values of a rules of a product
	
	Special Functions:
		fieldsObject2XML: Convert a fieldsObjec into an XML with the 
		structure that is needed for the SP.
---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
function fieldsObject2XML(obj){
	var tmp_result = "<Variables>"
	var fields= -1;
	for(key in obj){
		fields++;
		if(key != "idRule")
		tmp_result = tmp_result + '<Variable nombre="'+(key == 'totalAmount'? '@MontoTrx': key  == 'trxNo' ? '@CantidadTrx' : key == 'singleAmount' ? '@MontoIndividual' :  key == 'varation' ? '@Variacion' : '@Tiempo' )+'" tipoCampo="'+(key == 'idTime' ? 'Tiempo':'Numerico')+'" valor="'+obj[key]+'" />';
	}
	if (fields > 0) return tmp_result + "</Variables>";
	else return "";
}
setRulesByProduct = function(req,res){

	try{
		var v = new Validator();
		v.addSchema(ObjectRules, '/SchemaObjectRules');
		var errors = v.validate(req.body, ObjectRules).errors;
		if(errors.length==0){
			var idClient = JSON.parse(cryptools.decrypt(req.body.idSecretClient, { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_jasj", signAlgorithm: "sha1", signed: true })).identification;


			req.body.rules.forEach(function(rule,index){
			var IdRule   = JSON.parse(cryptools.decrypt(rule.idRule, { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_rule", signAlgorithm: "sha1", signed: true })).idRule;



			 var connection = new sql.Connection(Config.DB_CONFIG, function(err) {
				if(err){error.raise(req,res,err); return 1;}
				var request = new sql.Request(connection);
					request.input('Identificacion', sql.VarChar(50), idClient);
					request.input('Entidad', sql.VarChar(35),Config.ENTITY_NAME);
					request.input('nombreProducto', sql.VarChar(45), req.body.productName);
					request.input('IdRegla', sql.Int, IdRule);
					request.input('Activa', sql.Bit, 1); 
					request.input('Variables', sql.VarChar(1000),fieldsObject2XML(rule));
					request.input('Computadora', sql.VarChar(50), "-");
					request.input('DireccionIPOrigen', sql.VarChar(50), "127.0.0.1");
					request.input('Usuario', sql.VarChar(130), "api-user");
					
				
				
					
					request.execute('SENSP_ActualizarReglasXCliente', function(err, recordsets, returnValue) {
						console.log('SENSP_ActualizarReglasXCliente');
						if(err){error.raise(req,res,err); return 1;}
						
						
					});
				});
			});
			res.json({"status" : 200});

			}else{
			res.json({
				"status" : 452,
				"errors" : errors
			});console.log("452:"+errors);
		}
	}catch(error){
	res.json({"status" : 506});
	errorReporter.log({"method":"getMessagesByClient", "error":error});
	console.log("506:"+error);
}
}
	 