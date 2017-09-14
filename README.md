# probot-openshift-github-branches
Probot-based plugin to enable advanced branch workflows between GitHub and OpenShift

## Key Functionality
* Creates Open Shift services for each Pull Request
  * Removes these services if the Pull Request is closed unmerged
  * Will recreate them if they are later reopened
* Start new deployments to Open Shift via [Deployment Events](https://developer.github.com/v3/repos/deployments/) from the Pull Request (not Push Events like the native Open Shift GitHub Webhook plugin)
  * Will only initialize deployments if all status checks succeed (optional)
* Updates the Pull Request with the Open Shift deployment status
* Uses the existing branch service to execute a Canary Deployment on Pull Request merge


## Relevant Dependencies:
* [OpenShift-config-loader package](https://www.npmjs.com/package/openshift-config-loader): Wraps the OpenShift API in a Node.js module with methods for remote interaction
* [OpenShift-rest-client package](https://www.npmjs.com/package/openshift-rest-client): Provides OpenShift authentication supprt in Node.js
* [Probot](https://probot.github.io): Probot is an app framework for easily building integrations on top of the GitHub platform

## Deployment API notes
* https://developer.github.com/v3/guides/automating-deployments-to-integrators/

