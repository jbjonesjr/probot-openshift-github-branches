const util = require('util');

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
    console.log('openshift pr(', event.payload.number, ') was', event.payload.action, ': ', event.payload.pull_request.title, " branch name: " , event.payload.pull_request.head.ref);
    console.log('create OpenShift service now!');

    console.log(context.openshift.projects.find('*'));

  /*  OcRest.deploymentconfigs.create({}, {}).then(dc => {
      console.log(util.inspect(dc, false, null));
    }); */

    //create build for this branch
    //create deployment to read from this image that was built
    //create route for this deployment


    // routes point to services
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
