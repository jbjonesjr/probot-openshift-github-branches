const githubConn = require('./lib/github.js');
const openshiftConn = require('./lib/openshift.js');
const oscon = require('./lib/os-configurator.js');
const yaml = require('js-yaml');

module.exports = robot => {
  console.log('probot-openshift-github-branches was loaded!');

  robot.on(['pull_request.opened', 'pull_request.reopened'], pr_new);
  robot.on('push', commit_push);
  robot.on('status', status);
  robot.on('pull_request.closed', pr_close);
  robot.on('deployment', deploy);


  function init(context){
    context.loadYaml = async function(filename){
      try {
        const res = await this.github.repos.getContent(this.repo({path: filename}));
        file = yaml.safeLoad(Buffer.from(res.data.content, 'base64').toString()) || {};
      } catch (err) {
        if (err.code === 404) {
          file = null;
        } else {
          throw err
        }
      }
      return file;
    };

    context.loadJSON = async function(filename){
      try {
        const res = await this.github.repos.getContent(this.repo({path: filename}));
        file = yaml.safeLoad(Buffer.from(res.data.content, 'base64').toString()) || {};
      } catch (err) {
        if (err.code === 404) {
          file = null;
        } else {
          throw err
        }
      }
      return file;
    };
  }

  async function prepareOpenShiftClient(context){
    context.openshift_props = await context.loadYaml('infra/openshift.yaml');
    context.openshift = await oscon.getClient(context.openshift_props);
  }

  async function pr_new(context) {
    console.log('pr_new called');
    init(context);
    await prepareOpenShiftClient(context);

    githubConn.pr_opened(context);
    await openshiftConn.pr_opened(context);
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
