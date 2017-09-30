const expect = require('expect');
const fs = require('fs');
const {createRobot} = require('probot');
const plugin = require('..');
const prEvent = require('./fixtures/pull.opened');


require('dotenv').config();

describe('probot-openshift-branches ', () => {
  let robot;
  let github;

  beforeEach(() => {
    robot = createRobot();

    // Load the plugin
    // Mock out the GitHub API
    github = {
      integrations:{
        getInstallations: expect.createSpy()
      },
      paginate: expect.createSpy(),
      repos: {
        // Response for getting content from '.github/probot-freeze.yml'
        getContent: expect.createSpy().andCall(function(){
          let res = fs.readFileSync(require('path').resolve(__dirname,arguments[0].path.replace('infra','./sample_infra')));
          return Promise.resolve({data:{content:res}});
      })
      },
    };

    //infra/openshift.yaml
    // fs.saleLoad('infra/openshift.yaml');

    // Mock out GitHub client
    robot.auth = () => Promise.resolve(github);

    plugin(robot);
  });

  it('opens a new PR, creates OpenShift config', async () => {
    await robot.receive(prEvent);
  });
});
