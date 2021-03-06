- There is a race condition with checking deployment suitability:
  - Some Repositories won't have any statuses set, so you can't key off of the StatusEvent. Instead, you should deploy off of the PushEvent.
  - This is ok because the CreateDeployment request fails if any statuses are outstanding.
  - However, if you try to deploy before the status has a chance to be registered as pending, it will go through incorrectly.
- There is not an easy SHA->Pull Request API. I had to **assume** that the only branch in a status response was for the Pull Request I was interested in. If multiple branches are returned, I blindly choose the first one.
- Probot should be able to fireEvent internally, not just from an actual GitHub event.
- It would be nice if OpenShift/Probot could respond in the timeline that the openshift service has been created, or that the routes on merge have been updated.
- It would be nice if Probot let me interact with OpenShift to initiate an A/B test or Canary deploy from within the Pull Request.
