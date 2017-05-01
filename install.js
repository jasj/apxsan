var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'APPRIZ Mobile API',
  description: 'APPRIZ DEMO API for external connections.',
  script: require('path').join(__dirname,'api.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
  console.log("APPRIZ API Demo was installed sucessfully");
}); 

svc.install();