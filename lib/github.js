const util = require('util');
const DEBUG = false;

/* Helper function */
async function getPullRequestForHead(github, params) {
  let pullMatch = null;
  return github.pullRequests.getAll(params).then(pulls => {
    if (pulls.length == 0)
      return pullMatch;
    pullMatch = pulls.data.find(pull => {
      return 'refs/heads/' + pull.head.ref === params.head;
    });
    return pullMatch;
  });
}

module.exports = {
  async deploy(context) {
    console.log('fire deployment event');

    context.github.repos.createDeploymentStatus(Object.assign({
      id:context.payload.deployment.id, state:'pending', environment_url:'http://pr' + context.payload.deployment.payload.pull + '-' + context.payload.deployment.payload.branch + '.devnation-demo.apps.rhsademo.net'}, context.repo()));

    setTimeout(() => {
      context.github.repos.createDeploymentStatus(Object.assign({
        id:context.payload.deployment.id, state:'success', environment_url:'http://pr' + context.payload.deployment.payload.pull + '-' + context.payload.deployment.payload.branch + '.devnation-demo.apps.rhsademo.net'}, context.repo()));
    }, 60000);
  },

  async pr_opened(context) {
    console.log('no GitHub action on pr-open');
  },
  async pr_reopened(context) {
    this.pr_opened(context);
  },
  async push(context) {
    console.log('push happened.', 'is it relevant to a PR?');

    context.github.repos.createStatus(Object.assign({sha:context.payload.after, state:'success', context:'probot-branches', description:'OpenShift Deployment'}, context.repo()));

    const pull = await getPullRequestForHead(context.github, Object.assign({head:context.payload.ref}, context.repo()));

    if (pull === undefined) {
      console.log('This push was **NOT** part of a PR!');
    } else {
      await this.pr_commits(context, pull, context.repo());
    }
  },
  async status_for_commit(context) {

    const status = await context.github.repos.getCombinedStatusForRef(Object.assign({ref:context.payload.ref}, context.repo()));
    console.log('combined status: ', status.state);
    if (status.state === 'success') {
      console.log(context.payload, '\n\n\n', 'branches---', context.payload.branches[0]);
      const pull = await getPullRequestForHead(context.github, Object.assign({head:'refs/heads/' + context.payload.branches[0].name}, context.repo()));

      this.on_pr_status_success(context, pull);
    }
  },
  async pr_commits(context, pull) {
    console.log('This push **was** part of a PR!');
    console.log('Does this branch have statuses related to it?');
    try {
      await context.github.repos.getProtectedBranchRequiredStatusChecksContexts(Object.assign({branch:pull.head.ref}, context.repo()));
    } catch (err) {
      // No required statuses set. So maybe no statuses at all?
      if (err.code === 404) {
        // If any are pending, this will also fail. Give
        // the system 4 seconds for statuses to start to report
        setTimeout(this.on_pr_status_success.bind(null, context, pull), 4000);
      }
    }
  },

  async on_pr_status_success(context, pull) {
    context.github.repos.createDeployment(Object.assign({ref:context.payload.ref, environment:'staging-pr-' + pull.number, payload:{pull:pull.number, branch:pull.head.ref}}, context.repo()));
  },
  async pr_closed() {
  },
  async pr_merge() {
    console.log('turn on canary deploy');
  }
};
