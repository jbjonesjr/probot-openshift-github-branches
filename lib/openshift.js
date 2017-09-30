const util = require('util');
const ostemplate = require('./os-template')

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
  async pr_opened(context) {

    const event = context.event;
    console.log('openshift pr(', context.payload.number, ') was', context.payload.action, ': ', context.payload.pull_request.title, " branch name: " , context.payload.pull_request.head.ref);

    let ac = await ostemplate.fetchTemplates(context);
    ostemplate.updateTemplates(ac, context);

    // Use the client object to find a list of services to check connectivity
    console.log('finding services for connectivity check');

    console.log(await context.openshift.services.find('*'));


    console.log('the service to create is', ac.svc.metadata.name);
    console.log(ac.svc);
    console.log('--> creating service...');
    const createresult_service = await context.openshift.services.create(ac.svc);
console.log('foo');
    console.log('res',createresult_service);


    console.log('the deployment config to create is', ac.dc.metadata.name);
    console.log(ac.dc);
    console.log('--> creating deployment config...');
    const createresult_deploy = await context.openshift.deploymentconfigs.create(ac.dc)
    console.log(createresult_deploy);


    console.log('the image stream to create is ', ac.imagestream.metadata.name);
    console.log(ac.imagestream);
    console.log("--> creating image stream...");
    const createresult_imagestream = await context.openshift.imagestreams.create(ac.imagestream)
    console.log(createresult_imagestream);


    console.log('the build config to create is ', ac.bc.metadata.name);
    console.log(ac.bc);
    console.log('--> creating build config ...');
    const createresult_build = await context.openshift.buildconfigs.create(ac.bc)
    console.log(createresult_build);

    console.log("the route to create is ", ac.routes.metadata.name );
    console.log(ac.routes);
    console.log("--> creating route...");
    const createresult_route=await context.openshift.routes.create(ac.routes);
    console.log(createresult_route);
  },

  async pr_reopened(context) {
    this.pr_opened(context);
  },
  async pr_commits() {},
  async pr_closed(context) {
    const event = context.event;
    const merged = event.payload.pull_request.merged;
    console.log('pr(', event.payload.number, ') was ', event.payload.action, '(merged:', event.payload.pull_request.merged, '): ', event.payload.pull_request.title);
    if (merged) {
      await this.pr_merge();
    } else {
      console.log('destroy OpenShift service now!');
      console.log(context.openshift.projects.find('*'));
    }
  },
  async pr_merge() {
    console.log('OpenShift should start the deployment now');
    console.log(context.openshift.projects.find('*'));

  },
  async deploy() {
    console.log('OpenShift should start the deployment now');
    console.log(context.openshift.projects.find('*'));

  }
};

// Create service on
