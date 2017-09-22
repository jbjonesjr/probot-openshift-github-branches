const util = require('util');
const DEBUG = false;

/* Helper function */
async function getPullRequestForHead(github, params) {
  let pullMatch = null;
  return github.pullRequests.getAll(params).then(pulls => {
    pullMatch = pulls.find(pull => {
      return 'refs/heads/' + pull.head.ref === params.head;
    });
    return pullMatch;
  });
}

module.exports = {
  async deploy(event, context) {
    robot.log('fire deployment event');

    const queryObject = {owner:event.payload.repository.owner.login, repo:event.payload.repository.name};

    context.github.repos.createDeploymentStatus(Object.assign({
      id:event.payload.deployment.id, state:'pending', environment_url:'http://pr' + event.payload.deployment.payload.pull + '-' + event.payload.deployment.payload.branch + '.devnation-demo.apps.rhsademo.net'}, queryObject));

    setTimeout(() => {
      context.github.repos.createDeploymentStatus(Object.assign({
        id:event.payload.deployment.id, state:'success', environment_url:'http://pr' + event.payload.deployment.payload.pull + '-' + event.payload.deployment.payload.branch + '.devnation-demo.apps.rhsademo.net'}, queryObject));
    }, 60000);
  },

  async pr_opened(event, context) {
    robot.log('no GitHub action on pr-open');
  },
  async pr_reopened(event, context) {
    this.pr_opened(event, context);
  },
  async push(event, context) {
    robot.log('push happened.', 'is it relevant to a PR?');
    if (DEBUG) {
      robot.info(event);
    }
    const queryObject = {owner:event.payload.repository.owner.name, repo:event.payload.repository.name};

    context.github.repos.createStatus(Object.assign({sha:event.payload.after, state:'success', context:'jsunit', description:'JSUnit tests'}, queryObject));

    const pull = await getPullRequestForHead(context.github, Object.assign({head:event.payload.ref}, queryObject));

    if (pull === undefined) {
      robot.log('This push was **NOT** part of a PR!');
    } else {
      await this.pr_commits(event, context, pull, queryObject);
    }
  },
  async status_for_commit(event, context) {
    const queryObject = {owner:event.payload.repository.owner.login, repo:event.payload.repository.name};

    const status = await context.github.repos.getCombinedStatus(Object.assign({ref:event.payload.ref}, queryObject));
    robot.log('combined status: ', status.state);
    if (status.state === 'success') {
      robot.log(event.payload, '\n\n\n', 'branches---', event.payload.branches[0]);
      const pull = await getPullRequestForHead(context.github, Object.assign({head:'refs/heads/' + event.payload.branches[0].name}, queryObject));

      this.on_pr_status_success(event, context, pull, queryObject);
    }
  },
  async pr_commits(event, context, pull, queryObject) {
    robot.log('This push **was** part of a PR!');
    robot.log('Does this branch have statuses related to it?');
    try {
      await context.github.repos.getProtectedBranchRequiredStatusChecksContexts(Object.assign({branch:pull.head.ref}, queryObject));
    } catch (err) {
      // No required statuses set. So maybe no statuses at all?
      if (err.code === 404) {
        // If any are pending, this will also fail. Give
        // the system 4 seconds for statuses to start to report
        setTimeout(this.on_pr_status_success.bind(null, event, context, pull, queryObject), 4000);
      }
    }
  },

  async on_pr_status_success(event, context, pull, queryObject) {
    context.github.repos.createDeployment(Object.assign({ref:event.payload.ref, environment:'staging-pr-' + pull.number, payload:{pull:pull.number, branch:pull.head.ref}}, queryObject));
  },
  async pr_closed() {
  },
  async pr_merge() {
    robot.log('turn on canary deploy');
  }
};
