const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');
const util = require('util');

const fs = require('fs');
const ocp_myphp_service = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-build.json'));
const ocp_myphp_build = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-deploy.json'));
const ocp_myphp_deploy = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-service.json'));

console.log(ocp_myphp_service);
// RestClient.deploymentconfigs.create(dc-template,{/*params??*/})

// / {configLocation:'openshift-config.json'}
openshiftConfigLoader({configLocation:'openshift-config.yaml'}).then(config => {
  openshiftRestClient(config).then(client => {
    // Use the client object to find a list of projects, for example
    console.log('starting project find');
    client.projects.find().then(projects => {
      console.log(util.inspect(projects, false, null));
    });
    console.log('end project find, finding services');
    client.services.find('postgresql-probot').then(services => {
      console.log(util.inspect(services, false, null));
    });
    console.log('the service to create is');
    console.log(ocp_myphp_service);
    console.log('starting project create');
    const createresult = client.services.create(ocp_myphp_service).then(createresult => {
      console.log(createresult);
    });
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
