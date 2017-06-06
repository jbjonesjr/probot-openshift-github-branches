// Listening to github event pull_request.created to create a new openshift app based on the branch name used in the PR

/* const yaml = require('js-yaml'); */
const githubConn = require('./lib/github.js');
const openshiftConn = require('./lib/openshift.js');

module.exports = robot => {
  // Your plugin code here
  console.log('probot-openshift-github-branches was loaded!');

  robot.on('pull_request.opened', pr_new);
  robot.on('pull_request.reopened', pr_new);
  robot.on('push', commit_push);
  robot.on('status', status);
  robot.on('pull_request.closed', pr_close);
  robot.on('deployment', deploy);

  async function pr_new(event, context) {
     // Event.payload.pull_request.title
    githubConn.pr_opened(event, context);
    openshiftConn.pr_opened(event);
  }

  async function commit_push(event, context) {
    githubConn.push(event, context);
  }

  async function status(event, context) {
    console.log('status caught');
    event.payload.ref = event.payload.sha;
    githubConn.status_for_commit(context.github, event);
  }

/*
Async function pr_commit_push(event, context) {
    openshiftConn.pr_commit_push();
  }
*/
  async function pr_close(event, context) {
    // Const merged = context.issue.merged;
    githubConn.pr_closed(event, context);
  }

  async function deploy(event, context) {
    const ref = event.payload.deployment.ref;
    const commitRepo = event.payload.repository;

    console.log('should be calling openshift to spin a new version');
    console.log(event);
    console.log('envrionment url', 'https://' + event.payload.deployment.ref + '-openshift.com');

    openshiftConn.deploy(event);
    context.github.repos.createDeploymentStatus({
      owner:commitRepo.owner.login,
      repo:commitRepo.name,
      id:event.payload.deployment.id, state:'pending', environment_url:'https://' + ref.substring(1) + '-openshift.com'});
  }
};
