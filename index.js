const githubConn = require('./lib/github.js');
const openshiftConn = require('./lib/openshift.js');
const oscon = require('./lib/os-configurator.js');


module.exports = robot => {
  console.log('probot-openshift-github-branches was loaded!');

  robot.on(['pull_request.opened', 'pull_request.reopened'], pr_new);
  robot.on('push', commit_push);
  robot.on('status', status);
  robot.on('pull_request.closed', pr_close);
  robot.on('deployment', deploy);

  async function getOpenShiftConfig(context){
    context.openshift = oscon.getClient(robot.config('./infra/openshift.yaml'));
  }

  async function pr_new(context) {
    await getOpenShiftConfig(context);
    githubConn.pr_opened(context);
    openshiftConn.pr_opened(context);
  }

  async function commit_push(context) {
    githubConn.push(context);
  }

  async function status(context) {
    robot.log('status caught');
    context.payload.ref = context.payload.sha;
    githubConn.status_for_commit(context);
  }

/*
Async function pr_commit_push(event, context) {
    openshiftConn.pr_commit_push();
  }
*/
  async function pr_close(context) {
    // Const merged = context.issue.merged;
    githubConn.pr_closed(context);
  }

  async function deploy(context) {
    openshiftConn.deploy(context);
    githubConn.deploy(context);
  }

};
