const openShiftConfigLoader = require('openshift-config-loader');
const openShiftRestClient = require('openshift-rest-client');
const util = require('util');

const ocConfig = openShiftConfigLoader({configLocation:'./.openshift/config.yaml'});
const ocRest = openShiftRestClient(ocConfig);

function parseConfigs() {

	const ocp_myphp_service = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-service.json' ) );
	const ocp_myphp_deploy = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-deploy.json' ) );
	const ocp_myphp_imagestream = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-imagestream.json' ) );
	const ocp_myphp_build = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-build.json' ) );
	const ocp_myphp_route = JSON.parse(fs.readFileSync('scratchpad/ocp-myphp-php-route.json' ) );

	delete ocp_myphp_imagestream.metadata.resourceVersion;
	delete ocp_myphp_imagestream.metadata.selfLink;
	delete ocp_myphp_imagestream.metadata.uid;
	delete ocp_myphp_imagestream.metadata.annotations;
	delete ocp_myphp_imagestream.metadata.creationTimestamp;

	delete ocp_myphp_build.metadata.resourceVersion;
	delete ocp_myphp_build.metadata.selfLink;
	delete ocp_myphp_build.metadata.uid;
	delete ocp_myphp_build.metadata.annotations;
	delete ocp_myphp_build.metadata.creationTimestamp;
	delete ocp_myphp_build.status;

	delete ocp_myphp_deploy.metadata.resourceVersion;
	delete ocp_myphp_deploy.metadata.selfLink;
	delete ocp_myphp_deploy.metadata.uid;
	delete ocp_myphp_deploy.metadata.annotations;
	delete ocp_myphp_deploy.metadata.creationTimestamp;
	delete ocp_myphp_deploy.status;

	delete ocp_myphp_service.metadata.resourceVersion;
	delete ocp_myphp_service.metadata.selfLink;
	delete ocp_myphp_service.metadata.uid;
	delete ocp_myphp_service.metadata.annotations;
	delete ocp_myphp_service.metadata.creationTimestamp;
	delete ocp_myphp_service.status;

	delete ocp_myphp_route.metadata.resourceVersion;
	delete ocp_myphp_route.metadata.selfLink;
	delete ocp_myphp_route.metadata.uid;
	delete ocp_myphp_route.metadata.annotations;
	delete ocp_myphp_route.metadata.creationTimestamp;
	delete ocp_myphp_route.status;

	return { ocp_service:ocp_myphp_service, ocp_deploy:ocp_myphp_deploy, ocp_imagestream:ocp_myphp_imagestream, ocp_build:ocp_myphp_build, ocp_route:ocp_myphp_route };
}

function updateTemplate(ocp_template, pullrequestnumber, pullrequestbranchname) {
	var pullrequest_id = pullrequestnumber;
	ocp_template.ocp_imagestream.metadata.name = ocp_myphp_imagestream.metadata.name + '-pullrequest-' + pullrequest_id;
	ocp_template.ocp_imagestream.metadata.namespace = openshift_testnamespace;
	ocp_template.ocp_imagestream.status.dockerImageRepository = ocp_myphp_imagestream.status.dockerImageRepository + '-pullrequest-' + pullrequest_id;

	ocp_template.ocp_build.metadata.name = ocp_myphp_build.metadata.name + "-pullrequest-" + pullrequest_id ;
	ocp_template.ocp_build.metadata.namespace=openshift_testnamespace;
	ocp_template.ocp_build.spec.source.git.ref=pullrequestbranchname;
	ocp_template.ocp_build.spec.output.to.name=ocp_myphp_imagestream.metadata.name + ":latest";

	ocp_template.ocp_deploy.metadata.name = ocp_myphp_deploy.metadata.name + '-pullrequest-' + pullrequest_id;
	ocp_template.ocp_deploy.metadata.namespace = openshift_testnamespace;
	ocp_template.ocp_deploy.spec.template.spec.containers.image = ocp_myphp_imagestream.status.dockerImageRepository;
	ocp_template.ocp_deploy.spec.triggers[1].imageChangeParams.from.name = ocp_myphp_build.spec.output.to.name;
	// For ocp_template(i = 0; i < ocp_myphp_deploy.spec.triggers.length; i++) {
//		if (ocp_myphp_deploy.spec.triggers[i] && ocp_myphp_deploy.spec.triggers[i].type.hasOwnProperty("ImageChange")) {
//			ocp_myphp_deploy.spec.triggers[i].imageChangeParams.from.name=ocp_myphp_build.spec.output.to.name;
//		}
	// }

	ocp_template.ocp_service.metadata.name = ocp_myphp_service.metadata.name + '-pullrequest-' + pullrequest_id;
	ocp_template.ocp_service.metadata.namespace = openshift_testnamespace;

	ocp_template.ocp_route.metadata.name = ocp_myphp_route.metadata.name + "-pullrequest-" + pullrequest_id ;
	ocp_template.ocp_route.spec.alternateBackends[0].name=ocp_myphp_service.metadata.name;
	ocp_template.ocp_route.spec.alternateBackends[0].weight=10
	ocp_template.ocp_route.spec.to.weight=90
	ocp_template.ocp_route.spec.host="pullrequest-" + pullrequest_id + "-" + ocp_myphp_route.spec.host;

	return(ocp_template);
}

function createOCPresources(ocp_template) {
		    // Use the client object to find a list of projects, for example
		    console.log('starting project find');
		    ocRest.projects.find().then(projects => {
		      console.log(util.inspect(projects, false, null));
		    });
		    console.log('end project find, finding services');
		    ocRest.services.find('postgresql-probot').then(services => {
		      console.log(util.inspect(services, false, null));
		    });
		    console.log('the service to create is', ocp_template.ocp_service.metadata.name);
		    console.log(ocp_template.ocp_service);
		    console.log('--> creating service...');
		    const createresult_service = ocRest.services.create(ocp_template.ocp_service).then(createresult_service => {
		      console.log(createresult_service);
		    });

		    console.log('the deployment config to create is', ocp_template.ocp_deploy.metadata.name);
		    console.log(ocp_template.ocp_deploy);
		    console.log('--> creating deployment config...');
		    const createresult_deploy = ocRest.deploymentconfigs.create(ocp_template.ocp_deploy).then(createresult_deploy => {
		      console.log(createresult_deploy);
		    });

		    console.log('the image stream to create is ', ocp_template.ocp_imagestream.metadata.name);
		    console.log(ocp_template.ocp_imagestream);
		    console.log("--> creating image stream...");
		    const createresult_imagestream=ocRest.imagestreams.create(ocp_template.ocp_imagestream).then(createresult_imagestream => { console.log(createresult_imagestream); } );

		    console.log('the build config to create is ', ocp_template.ocp_build.metadata.name);
		    console.log(ocp_template.ocp_build);
		    console.log('--> creating build config ...');
		    const createresult_build = ocRest.buildconfigs.create(ocp_template.ocp_build).then(createresult_build => {
		      console.log(createresult_build);
		    });

		    console.log("the route to create is ", ocp_template.ocp_route.metadata.name );
		    console.log(ocp_template.ocp_route);
		    console.log("--> creating route...");
		    const createresult_route=ocRest.routes.create(ocp_template.ocp_route).then(createresult_route => { console.log(createresult_route); } );
}

/*
Async function deploy_complete(event, context, owner, repoName) {
  const ref = event.payload.deployment.ref;
  context.github.repos.createDeploymentStatus({
    owner,
    repo:repoName,
    id:event.payload.deployment.id, state:'success', environment_url:'https://' + ref.substring(1) + '-openshift.com'});
}
*/
module.exports = {
  async pr_opened(event) {
    console.log('openshift pr(', event.payload.number, ') was', event.payload.action, ': ', event.payload.pull_request.title, " branch name: " , event.payload.pull_request.head.ref);
    console.log('create OpenShift service now!');
    console.log(util.inspect(ocRest));

    console.log(ocRest.projects.find('*'));
    var ocp_template = parseConfigs();
    var ocp_template_customized = updateTemplate(ocp_template, event.payload.number, event.payload.pull_request.head.ref);
    createOCPresources(ocp_template_customized);

  /*  OcRest.deploymentconfigs.create({}, {}).then(dc => {
      console.log(util.inspect(dc, false, null));
    }); */
  },
  async pr_reopened(event) {
    this.pr_opened(event);
  },
  async pr_commits() {},
  async pr_closed(event) {
    const merged = event.payload.pull_request.merged;
    console.log('pr(', event.payload.number, ') was ', event.payload.action, '(merged:', event.payload.pull_request.merged, '): ', event.payload.pull_request.title);
    if (merged) {
      await this.pr_merge();
    } else {
      console.log('destroy OpenShift service now!');
      console.log(ocRest.projects.find('*'));
    }
  },
  async pr_merge() {
    console.log('OpenShift should start the deployment now');
    console.log(ocRest.projects.find('*'));

  },
  async deploy() {
    console.log('OpenShift should start the deployment now');
    console.log(ocRest.projects.find('*'));

  }
};

// Create service on
