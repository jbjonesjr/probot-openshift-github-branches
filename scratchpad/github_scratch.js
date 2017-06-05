const GitHubApi = require('./node_modules/github');

const github = new GitHubApi({
    // Optional
  debug: true,
  protocol: 'https',
  host: 'api.github.com', // Should be api.github.com for GitHub
  pathPrefix: '', // For some GHEs; none for GitHub
  headers: {},
  followRedirects: false, // Default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
  timeout: 5000
});

github.repos.createDeployment({owner:'jbjonesjr', repo: 'sample-php', state:'all', ref:'new-test-branch', environment:'staging-pr-1'},
(err, res) => {
  console.log(res);
});
