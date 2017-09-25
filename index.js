// Listening to github event pull_request.created to create a new openshift app based on the branch name used in the PR

/* const yaml = require('js-yaml'); */
const githubConn = require('./lib/github.js');
const openshiftConn = require('./lib/openshift.js');
const oscon = require('./lib/os-configurator.js');

module.exports = robot => {
  // Your plugin code here
  console.log('probot-openshift-github-branches was loaded!');

  robot.on('pull_request.opened', pr_new);
  robot.on('pull_request.reopened', pr_new);
  robot.on('push', commit_push);
  robot.on('status', status);
  robot.on('pull_request.closed', pr_close);
  robot.on('deployment', deploy);

  async function getOpenShiftConfig(context){
    context.openshift = oscon.getClient(robot.config('./infra/openshift.yaml'));
  }

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
    githubConn.status_for_commit(event, context);
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
    openshiftConn.deploy(event);
    githubConn.deploy(event, context);
  }
};
