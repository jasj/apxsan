/*
		Appriz mobile 2014
		API MAIN FILE 
		
		Description: 
*/

/* Dependence:
		-EXPRESS
		-Crypto
		-cryptools
		-MSSQL
		-CONSTANST 
		-jsonschema
		-ASYNC
		-LOGGLY
*/
//============================================================================

/*---------------------------------------------------------------------------/
    Date:    2014-07-18
    Author:  Segreda Johanning, Juan Andres
    Changes:
       First version, Alpha release 
/---------------------------------------------------------------------------*/                                                                 

//external configuration
Config = require('./appriz_config.json');

// call the packages we need
var express    = require('express'); 	
var forceSSL = require('express-force-ssl');
var fs = require('fs');
var http = require('http');
var https = require('https');	
var app        = express();; 				// define our app using express
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
async = require("async");
Validator = require('jsonschema').Validator;
crypto = require('crypto');
cryptools = require('cryptools')
var loggly = require('loggly'); 

var ssl_options = {
  key: fs.readFileSync(Config.HTTPS.key),
  cert: fs.readFileSync(Config.HTTPS.cert),
  ca: fs.readFileSync(Config.HTTPS.ca),
};

var server = http.createServer(app);
var secureServer = https.createServer(ssl_options, app);



error = require('./functions/raise.js');


errorReporter = loggly.createClient(Config.LOGGLY);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
};



 
app.use(allowCrossDomain);
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
var port = process.env.PORT || Config.PORT; 		// set the  port
PM = new Client(); //Client to PM
soap = require('soap');
sql = require('mssql'); 

var router = express.Router(); 				// get an instance of the express Router
require('./external_data.js');


//External Data


//==========================================================//
//					VALIDATION SCHEMAS						//
//==========================================================//
objectClient 	  = require('./Schemas/SchemaObjectClient.json');
objectClientId	  = require('./Schemas/SchemaobjectClientId.json');
objectService 	  = require('./Schemas/SchemaobjectService.json');
ObjectRules		  = require('./Schemas/SchemaObjectRules.json');
objectByProduct	  = require('./Schemas/SchemaByProduct.json');
objectSecretKey   = require('./Schemas/SchemaSecretKey.json');

//==========================================================//
//						METHODS FILES						//
//==========================================================//
require('./Methods/bindClient_method.js');
require('./Methods/getMessagesByClient_method.js');
require('./Methods/getRulesByProduct_method.js');
require('./Methods/setRulesByProduct_method.js');
require('./Methods/getTimePeriods_method.js');
require('./Methods/getProductsByClient_method.js');
require('./Methods/getTimePeriods_method.js');
require('./Methods/getServicesByProduct_method.js');
require('./Methods/sendServiceRequest_method.js');

//==========================================================//
//						API METHODS							//
//==========================================================//

router.post('/bindClient', bindClient);
router.post('/getMessagesByClient', getMessagesByClient); 
router.post('/getRulesByProduct', getRulesByProduct );
router.post('/setRulesByProduct', setRulesByProduct);
router.post('/getTimePeriods',getTimePeriods);
router.post('/getProductsByClient', getProductsByClient);
router.post('/getServicesByProduct',getServicesByProduct);
router.post('/sendServiceRequest', sendServiceRequest);

router.get('/',function(req,res){res.send(200)});

//The method setMessageStatus was not implemented in this version
router.post('/setMessageStatus', function(req, res) {
	res.json({ method: 'getMessagesByClient' });	
});
	
	

app.use(forceSSL);	


// REGISTER  ROUTES -------------------------------
// all of our routes will be prefixed with /appriz
app.use('/appriz', router);
// START THE SERVER
// =============================================================================
//app.listen(port);
secureServer.listen(port)



console.log('Magic happens on port ' + port);







