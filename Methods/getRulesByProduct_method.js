/*
		Appriz mobile 2014
		Service: getRulesByProduct
*/

/*--------------------------------------------------------------------------/
	Description:
	Get  rules of a product
---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
getRulesByProduct = function(req,res){ 
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
				
					
					request.execute('PM_getRulesByProduct', function(err, recordsets, returnValue) {
						console.log('PM_getRulesByProduct');
						if(err){error.raise(req,res,err); return 1;}
						tmp_rules_holder = {};
							recordsets[0].forEach(function(defaultValue, index){
								var idSecretRule = {
									"idRule" :  defaultValue['idRule'],
									"date" : Date()
								};
								var idUp = cryptools.encrypt(JSON.stringify(idSecretRule), { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_rule", signAlgorithm: "sha1", signed: true });
								if (!(idUp  in  tmp_rules_holder)){
									tmp_rules_holder[idUp] = {};
								}
								tmp_rules_holder[idUp]['idRule'] = idUp;
								tmp_rules_holder[idUp]['ruleName'] = defaultValue['ruleName'];
								tmp_rules_holder[idUp]['active'] = defaultValue['Setted'] ? true : false;
								tmp_rules_holder[idUp]['description'] = defaultValue['description'].replace(new RegExp( "@MontoTrx", "g" ), "<[totalAmount]>").replace(new RegExp( "@CantidadTrx", "g" ), "<[trxNo]>").replace(new RegExp( "@MontoIndividual", "g" ), "<[singleAmount]>").replace(new RegExp( "@Variacion", "g" ), "<[varation]>").replace(new RegExp( "@Tiempo", "g" ), "<[idTime]>");
								tmp_rules_holder[idUp][defaultValue['Variable'] == 1? "totalAmount" : defaultValue['Variable'] == 2 ? "trxNo" :  defaultValue['Variable'] == 3 ? "singleAmount" :  defaultValue['Variable'] == 4 ? "varation" : "idTime" ] = parseInt(defaultValue['Suggest']);
						});
						returndata = [];
						for( key in tmp_rules_holder){
							returndata.push(tmp_rules_holder[key]);
						}
							console.log(JSON.stringify(returndata));
							res.json({"status" : 200, "rules": returndata});
					});
		});
		
		}else{
					res.json({
						"status" : 452,
						"errors" : errors
					});
			}
	}catch(error){
		res.json({"status" : 506});
		errorReporter.log({"method":"getTimePeriods", "error":error});
	}

}