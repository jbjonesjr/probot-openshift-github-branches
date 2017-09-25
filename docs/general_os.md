log into the open shift web console
help > command line tools {fqdn/console/command-line}
copy the oc login string (the token is hidden but is copied when you use the clipboard icon)

paste it locally to login.
This copies the server config and details into ~/.kube/config


## Requirements
probot requires node >7.8.0
OpenShiftConfigLoader requires node > 8.0.0 because of util.promisfy
