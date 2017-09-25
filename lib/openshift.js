const openShiftConfigLoader = require('openshift-config-loader');
const openShiftRestClient = require('openshift-rest-client');
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
  async pr_opened(event) {
    console.log('openshift pr(', event.payload.number, ') was', event.payload.action, ': ', event.payload.pull_request.title, " branch name: " , event.payload.pull_request.head.ref);
    console.log('create OpenShift service now!');
    console.log(util.inspect(ocRest));

    console.log(ocRest.projects.find('*'));

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
