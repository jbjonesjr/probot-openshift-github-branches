const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');
const util = require('util');

openshiftConfigLoader({configLocation:'openshift-config.json'}).then(config => {
  OpenshiftRestClient(config).then(client => {
    // Use the client object to find a list of projects, for example
    // client.projects.find().then(projects => {
    //   console.log(util.inspect(projects, false, null));
    // });
    // client.services.find().then(services => {
    //   console.log(util.inspect(services, false, null));
    // });
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
