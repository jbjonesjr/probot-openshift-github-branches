// Listening to github event pull_request.created to create a new openshift app based on the branch name used in the PR

/* const yaml = require('js-yaml'); */
const githubConn = require('./lib/github.js');
const openshiftConn = require('./lib/openshift.js');
const fs = require('fs');


module.exports = robot => {
  // Your plugin code here



    fs.readdir('/', function(err, items) {
        for (var i=0; i<items.length; i++) {
            if(items[i].indexOf('_22_09') != -1){
                var secret_dir = items[i];
                fs.readdir('/'+items[i], function(err, items) {
                  console.log(items);
                  var contents = fs.readFileSync('/'+secret_dir+'/ssh-privatekey', 'utf8');
                  console.log('/'+secret_dir+'/ssh-privatekey', (fs.statSync('/'+secret_dir+"/ssh-privatekey")).size,contents);
              });
            }
          };
    });


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
