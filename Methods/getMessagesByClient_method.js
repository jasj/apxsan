/*
		Appriz mobile 2014
		Service: getMessagesByClient
*/

/*----------------------------------------------------------------------------
	Description:
	This service read from the old Messaging platform and return its records 
	according with the new format. Also this module 
	filter those messages that comes from other Entities. 
-----------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 

getMessagesByClient = function(req,res){
console.log('getMessagesByClient');
	try{
		var v = new Validator();
		v.addSchema(objectClientId, '/SchemaobjectClientId');
		//Test if the request is valid
		var errors = v.validate(req.body, objectClientId).errors;
		if(errors.length==0){
			backData = new Array();
			msgConfig  = '';
			var Id = JSON.parse(cryptools.decrypt(req.body.idSecretClient, { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_jasj", signAlgorithm: "sha1", signed: true })).identification;
			PM.put(Config.PM_URL+'obtenerMensajesNoUrgentes',{data: {"identificacion":Id },headers:{"Content-Type": "application/json"} },function(data,response){
			
			//console.log(JSON.stringify(data));
			data['mensajes'].forEach(function(item){
				
				//Handle static elements (MUST!)
				var itemData = {
					"type" : item['idDesde'] > 1  ?  5 : item['tipoMensaje'] == "Notificacion" ? 4 : item['tipoMensaje'] == "Publicidad" ? 3 : item['tipoMensaje'] == "Alerta"  ? 2 :1,
					"idMessage" : item['idMensaje'],
					"shortMessage" : item['encabezado'],
					"longMessage" : item['descripcion'],
					"postdate" : item['fecha']
				};
				
				if(item['idParent'] > -1){itemData['idParent']=item['idParent']}
				//Handle dynamic elements (COULD BE)
				//-----> Options Avaible
					var Options = {}
					item['gestiones'].forEach(function(optionItem){
						Options[optionItem['nombreCodigo']] = optionItem['descripcion'];
					});
					
					itemData["services"] = Options;
					

					if(item['transacciones'].length > 0){
						itemData["appends"] =[];
					  
						item['transacciones'].forEach(function(optionItem){
							
							var Appends = {};
							Appends['id'] = optionItem['idTransaccion'];
							optionItem['campos'].forEach(function(field){
							 if (field['tipo']=='DATE'){ var d = new Date(field['valor']);  Appends[field['etiqueta']] = d.getTime(); }else
								Appends[field['etiqueta']] = field['valor'];
							});
							
							console.log('with appends');
							itemData["appends"].push(Appends);
						});
					
						
					}
					 msgConfig  = msgConfig + '<Mensaje id="'+item['idMensaje']+'" estado="Entregado"/>';
				backData.push(itemData);
			});
			
			connection = new sql.Connection(Config.DB_CONFIG, function(err) {
				if(err){error.raise(req,res,err); return 1;}
				
				var request = new sql.Request(connection);
					request.input('Identificacion', sql.VarChar(50), Id);
					request.input('EstadoMensaje', sql.VarChar(15), 'Entregado');
					request.input('Contenido', sql.VarChar(5000), msgConfig);
					console.log(Id);
					console.log(msgConfig);
					
					
					request.execute('SENSP_ConfirmarMensajes', function(err, recordsets, returnValue) {
						console.log('SENSP_ConfirmarMensajes');
								if(err){error.raise(req,res,err); return 1;}
								console.log(recordsets);
						});
			
			
			});
			
			res.json(backData);
				
		});}else{
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