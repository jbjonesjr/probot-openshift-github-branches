const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');
const util = require('util');

const fs = require('fs')
const service_postgresql = JSON.parse(fs.readFileSync('scratchpad/sample-service.json' ) );
console.log(service_postgresql);
//restClient.deploymentconfigs.create(dc-template,{/*params??*/})

/// {configLocation:'openshift-config.json'}
openshiftConfigLoader({configLocation:'openshift-config.yaml'}).then(config => {
  openshiftRestClient(config).then(client => {
    // Use the client object to find a list of projects, for example
    console.log("starting project find");
	  client.projects.find().then(projects => {
      console.log(util.inspect(projects, false, null));
    });
	    console.log("end project find, finding services");
    client.services.find("postgresql-probot").then(services => {
       console.log(util.inspect(services, false, null));
    });
    console.log("the service to create is");
    console.log(service_postgresql);
    console.log("starting project create");    
    const createresult=client.services.create(service_postgresql).then(createresult => { console.log(createresult); } );
    //
    // client.deploymentconfigs.find('').then(dc => {
    //   console.log(util.inspect(dc, false, null));
    // });
    //
    // client.deploymentconfigs.create({}, {}).then(dc => {
    //   console.log(util.inspect(dc, false, null));
    // });
  });
});
