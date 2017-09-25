

./oc new-app bucharestgold/centos7-s2i-nodejs:latest~https://github.com/jbjonesjr/probot-openshift-github-branches.git

Service Account has to be `probot`
Add env variables to openshift:
* OS_SA_TOKEN
* OS_SA_SERVER
