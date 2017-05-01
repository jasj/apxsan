/*
		Appriz mobile 2014
		Service: sendServiceRequest
*/

/*---------------------------------------------------------------------------/
	Description:
	This service is used by the client to request an entity's service. 
----------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/ 
sendServiceRequest = function(req,res){ 

try{
	var v = new Validator();
	v.addSchema(objectService, '/SchemaobjectService');
	var errors = v.validate(req.body, objectService).errors;
	if(errors.length==0){
		console.log("sendServiceRequest");
		var Id = JSON.parse(cryptools.decrypt(req.body.idSecretClient, { encryptKey: Config.IDENTITY.sessionId, signKey: "andres_jasj", signAlgorithm: "sha1", signed: true })).identification;
		console.log(Id);
		
		var toData={
			"idMensaje": ('idMessage' in req.body) ? req.body.idMessage : 0,
			"encabezado": "encabezado",
			"estadoMensaje": "No Leido",
			"nombreEntidad": Config.ENTITY_NAME,
			"lenguajeStr": "en",
			"descripcion": "descripcion",
			"idParent": ('idMessage' in req.body) ? req.body.idMessage : -1,
			"lenguajeMensaje": "en",
			"esGestion": "true",
			"tieneFechaRecordatorio": "false",
			"identity": {
			"userName": Id,
			"computer": "3d73543460c43a719bbe8d11232795a3",
			"ipAddress": Id
		},
			"gestiones": {
			"nombreCodigo": req.body.code,
			"tipo": ("productName" in req.body) ? "Producto" : "Entidad",
			"descripcion": req.body.description
			},
			"identificacion": Id
		};

		if("productName" in req.body){
		toData["producto"] = req.body.productName;
		}

		PM.put(Config.PM_URL+'procesarGestion',{data: toData,headers:{"Content-Type": "application/json"} },function(data,response){
			if(data=="COMPLETADO"){
				res.json({"status" : 200});
			}else{
				res.json({"status":404});
			}
			
		});
		
	}else{
		res.json({
			"status" : 452,
			"errors" : errors
		});	console.log("452:"+errors);
	}
}catch(error){
	res.json({"status" : 506});
	errorReporter.log({"method":"sendServiceRequest", "error":error});
	console.log("506:"+error);
}

}