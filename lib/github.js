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
/*
Async function deploy(event, context, commitRepo) {
  console.log('fire deployment event');
  context.github.repos.createDeploymentStatus({
    owner:commitRepo.owner.login,
    repo:commitRepo.name,
    id:event.payload.deployment.id, state:'pending', environment_url:'https://' + event.payload.deployment.ref + '-openshift.com'});
}
*/
module.exports = {
  async pr_opened() {
    return '';
  },
  async pr_reopened() {
    this.pr_opened();
  },
  async push(event, context) {
    console.log('push happened, is it relevant to a PR?', event);
    const commitRepo = event.payload.repository;
    const pull = await getPullRequestForHead(context.github, {owner:commitRepo.owner.name, repo:commitRepo.name, head:event.payload.ref});
    if (pull === undefined) {
      console.log('this push was **NOT** part of a PR!');
    } else {
      await this.pr_commits(event, context, pull, commitRepo);
    }
  },
  async status_for_commit(event, context) {
    const queryObject = {owner:event.payload.repository.owner.login, repo:event.payload.repository.name};
    const status = await context.github.repos.getCombinedStatus(Object.assign({ref:event.payload.ref}, queryObject));
    console.log('combined status', '\n', status.state, '\n', status);
    if (status.state === 'success') {
      this.on_pr_status_success(event, context, getPullRequestForHead(context.github, Object.assign({head:event.payload.ref}, queryObject)), queryObject);
    }
  },
  async pr_commits(event, context, pull, commitRepo) {
    console.log('this push **was** part of a PR!');
    console.log('Does this branch have statuses related to it?');
  },

  async on_pr_status_success(event, context, pull, queryObject) {
    context.github.repos.createDeployment(Object.assign({ref:event.payload.ref, environment:'staging-pr-' + pull.number}, queryObject));
  },
  async pr_closed() {
  },
  async pr_merge() {
    console.log('turn on canary deploy');
  }
};
