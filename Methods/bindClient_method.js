/*
		Appriz mobile 2014
		Service: setRulesByProduct
*/

/*--------------------------------------------------------------------------/
	Description:
	This method bind a client with the ACS, and it´s return a secret 
	identification that should be used for consume the others services of the API.
	
	Special Functions:
		ProductObject2XML: Convert a Product Objec to an XML with the 
		structure that is needed for the SPs.
---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
function ProductObject2XML(obj){
	var tmp_result = "<Productos>"
	for(key in obj){
		tmp_result = tmp_result + '<Producto nombre="'+key+'" numeroAso="" cuenta="" tipoProd="'+obj[key]+'" />';
	}
	return tmp_result + "</Productos>"
}

function endBindClient(req,res){
	var idSecretClient = {"identification": req.body.uuid, "date" : Date() }

	res.json({
	"status" : 200,
	"idSecretClient"  : cryptools.encrypt(JSON.stringify(idSecretClient), { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_jasj", signAlgorithm: "sha1", signed: true })
	});
}

function confirmSubscription(req,res,connection,idUp){
	var request = new sql.Request(connection);
	request.input('Identificacion', sql.VarChar(18), req.body.identification);
	request.input('UniqueIdentifier', sql.VarChar(50), req.body.uuid);
	request.input('NumeroSolicitud', sql.VarChar(40), idUp);
	request.input('Computadora', sql.VarChar(30), "");
	request.input('DireccionIPOrigen', sql.VarChar(50), "127.0.0.1");
	request.input('Usuario', sql.VarChar(130), "api-user");
	request.input('NumeroMovil', sql.VarChar(1024), req.body.regId);

	request.execute('SENSP_ConfirmarInscripcion', function(err, recordsets, returnValue) {
			console.log('Confirmar suscription');
			console.dir(recordsets);
			if(err){error.raise(req,res,err); return 1;}
			endBindClient(req,res);
	});
}

function updateSubscription(req,res,connection,idUp){
	var request = new sql.Request(connection);
	request.input('Numero', sql.Int, 1);
	request.input('CheckSum', sql.VarChar(50), "");
	request.input('Computadora', sql.VarChar(50), "");
	request.input('DireccionIPOrigen', sql.VarChar(50), "127.0.0.1");
	request.input('Identificacion', sql.NVarChar(50), req.body.identification);
	request.input('Usuario', sql.NVarChar(130), "api-user");
	request.input('Entidad', sql.NVarChar(35), Config.ENTITY_NAME);
	request.input('Operacion', sql.Int, 0);
	request.input('Credencial', sql.VarChar(50), "");
	request.input('Productos', sql.VarChar(4000), '<Productos><Producto nombre="Roja de los ticos23" numeroAso="712" cuenta="993-2020-393" tipoProd="TarjetaCredito" /></Productos>');

	request.execute('SENSP_ActualizarSolicitud', function(err, recordsets, returnValue) {
			console.log('Establecer num de solicitud');
			console.dir(recordsets);
			if(err){error.raise(req,res,err); return 1;}
			confirmSubscription(req,res,connection,idUp)
	});	
	
}

function addSubscription(req,res,connection,idUp){
	var request = new sql.Request(connection);
	request.input('Numero', sql.Int, 1);
	request.input('CheckSum', sql.VarChar(50), "");
	request.input('Computadora', sql.VarChar(50), "");
	request.input('DireccionIPOrigen', sql.VarChar(50), "127.0.0.1");
	request.input('Identificacion', sql.NVarChar(50), req.body.identification);
	request.input('Usuario', sql.NVarChar(130), "api-user");
	request.input('Entidad', sql.NVarChar(35), Config.ENTITY_NAME);
	request.input('Productos', sql.VarChar(4000), ProductObject2XML(req.body.products));

	request.execute('SENSP_AgregarSolicitud', function(err, recordsets, returnValue) {
			console.log('Agregar productos');
			console.dir(recordsets);
			if(err){error.raise(req,res,err); return 1;}
			updateSubscription(req,res,connection,idUp)
	});	

}

function updateCustomer(req,res,connection,idUp){
	var request = new sql.Request(connection);
	request.input('Identificacion', sql.NVarChar(18), req.body.identification);
	request.input('Nombre', sql.NVarChar(30), req.body.firstName);
	request.input('Apellido1', sql.NVarChar(30), req.body.lastName);
	request.input('Apellido2', sql.NVarChar(30), "");
	request.input('pais', sql.VarChar(150), "");
	request.input('Enabled', sql.Bit, 1);
	request.input('NumeroActual', sql.Int, 1);
	request.input('NumeroMovil', sql.VarChar(1024), req.body.regId);
	request.input('Computadora', sql.VarChar(50), "api-test");
	request.input('DireccionIPOrigen', sql.VarChar(50), "127.0.0.1");
	request.input('Usuario', sql.NVarChar(130), "api-user");
	request.input('Entidad', sql.NVarChar(35), Config.ENTITY_NAME);
	request.input('Gestiones', sql.VarChar(2000), "");


	//request.output('output_parameter', sql.VarChar(50));
	request.execute('SENSP_ActualizarCliente', function(err, recordsets, returnValue) {
		console.log('Actualizar/Agregar cliente');
		console.dir(recordsets);
		if(err){error.raise(req,res,err); return 1;}
		addSubscription(req,res,connection,idUp)
	});
}




bindClient = function(req,res){ 
try{
	var v = new Validator();
	var shasum = crypto.createHash('sha1');
	v.addSchema(objectClient, '/SchemaObjectClient');
	//Test if the request is valid
	var errors = v.validate(req.body, objectClient).errors;
	
	if(errors.length==0){
		if(req.body.secretKey == Config.IDENTITY.sessionId ){
			shasum.update(req.body.identification+"1"+req.body.identification);
			var idUp = shasum.digest('hex').toLowerCase();
			console.log(idUp);
			//Create the Client on the APPRIZ DB
			var connection = new sql.Connection(Config.DB_CONFIG, function(err) {
			if(err){error.raise(req,res,err); return 1;}
				updateCustomer(req,res,connection,idUp);
			});
		}else{
			res.json({"status" : 401})
		}	
	}else{
		res.json({
			"status" : 452,
			"errors" : errors
		});
	}
}catch(error){
	res.json({"status" : 506});
	errorReporter.log({"method":"getMessagesByClient", "error":error});
}
}