const openshiftConfigLoader = require('openshift-config-loader');
const openshiftRestClient = require('openshift-rest-client');
const util = require('util');

// For TESTING the id of the pull request, should be extracted from the deployment object from github
const pullrequest_id=1221

const fs = require('fs')
const ocp_myphp_service = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-service.json' ) );
const ocp_myphp_deploy = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-deploy.json' ) );
const ocp_myphp_imagestream = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-imagestream.json' ) );
const ocp_myphp_build = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-build.json' ) );

const openshift_registry="172.30.87.166:5000"
//const openshift_testnamespace="mepley-test"
const openshift_testnamespace="mepley-devnation-federal-2017"
	
	
ocp_myphp_imagestream.metadata.name = ocp_myphp_imagestream.metadata.name + "-pullrequest-" + pullrequest_id ;
ocp_myphp_imagestream.metadata.namespace=openshift_testnamespace;
ocp_myphp_imagestream.status.dockerImageRepository = ocp_myphp_imagestream.status.dockerImageRepository + "-pullrequest-" + pullrequest_id ;
delete ocp_myphp_imagestream.metadata.resourceVersion;
delete ocp_myphp_imagestream.metadata.selfLink;
delete ocp_myphp_imagestream.metadata.uid;
delete ocp_myphp_imagestream.metadata.annotations;
delete ocp_myphp_imagestream.metadata.creationTimestamp;

ocp_myphp_build.metadata.name = ocp_myphp_build.metadata.name + "-pullrequest-" + pullrequest_id ;
ocp_myphp_build.metadata.namespace=openshift_testnamespace;
ocp_myphp_build.spec.output.to.name=ocp_myphp_imagestream.metadata.name + ":latest";
delete ocp_myphp_build.metadata.resourceVersion;
delete ocp_myphp_build.metadata.selfLink;
delete ocp_myphp_build.metadata.uid;
delete ocp_myphp_build.metadata.annotations;
delete ocp_myphp_build.metadata.creationTimestamp;
delete ocp_myphp_build.status;

ocp_myphp_deploy.metadata.name = ocp_myphp_deploy.metadata.name + "-pullrequest-" + pullrequest_id ;
ocp_myphp_deploy.metadata.namespace=openshift_testnamespace;
ocp_myphp_deploy.spec.template.spec.containers.image = ocp_myphp_imagestream.status.dockerImageRepository;
ocp_myphp_deploy.spec.triggers[1].imageChangeParams.from.name=ocp_myphp_build.spec.output.to.name;
//for (i = 0; i < ocp_myphp_deploy.spec.triggers.length; i++) {
//	if (ocp_myphp_deploy.spec.triggers[i] && ocp_myphp_deploy.spec.triggers[i].type.hasOwnProperty("ImageChange")) {
//		ocp_myphp_deploy.spec.triggers[i].imageChangeParams.from.name=ocp_myphp_build.spec.output.to.name;
//	}
//}

delete ocp_myphp_deploy.metadata.resourceVersion;
delete ocp_myphp_deploy.metadata.selfLink;
delete ocp_myphp_deploy.metadata.uid;
delete ocp_myphp_deploy.metadata.annotations;
delete ocp_myphp_deploy.metadata.creationTimestamp;
delete ocp_myphp_deploy.status;

ocp_myphp_service.metadata.name = ocp_myphp_service.metadata.name + "-pullrequest-" + pullrequest_id ;
ocp_myphp_service.metadata.namespace=openshift_testnamespace;
delete ocp_myphp_service.metadata.resourceVersion;
delete ocp_myphp_service.metadata.selfLink;
delete ocp_myphp_service.metadata.uid;
delete ocp_myphp_service.metadata.annotations;
delete ocp_myphp_service.metadata.creationTimestamp;
delete ocp_myphp_service.status;

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
    console.log("the service to create is", ocp_myphp_service.metadata.name );
    console.log(ocp_myphp_service);
    console.log("--> creating service...");
    const createresult_service=client.services.create(ocp_myphp_service).then(createresult_service => { console.log(createresult_service); } );

    console.log("the deployment config to create is", ocp_myphp_deploy.metadata.name );
    console.log(ocp_myphp_deploy);
    console.log("--> creating deployment config...");
    const createresult_deploy=client.deploymentconfigs.create(ocp_myphp_deploy).then(createresult_deploy => { console.log(createresult_deploy); } );

    console.log("the build config to create is ", ocp_myphp_build.metadata.name );
    console.log(ocp_myphp_build);
    console.log("--> creating build config ...");
    const createresult_build=client.buildconfigs.create(ocp_myphp_build).then(createresult_build => { console.log(createresult_build); } );

    console.log("the image stream to create is ", ocp_myphp_imagestream.metadata.name );
    console.log(ocp_myphp_imagestream);
    console.log("--> creating image stream...");
    const createresult_imagestream=client.imagestreams.create(ocp_myphp_imagestream).then(createresult_imagestream => { console.log(createresult_imagestream); } );

  });
});
