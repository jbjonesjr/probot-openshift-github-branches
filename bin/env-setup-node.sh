#!/bin/bash

# create openshift-config.json from https://www.npmjs.com/package/openshift-rest-client

curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -


sudo npm install npm@latest -g


npm install --save


npm start


Use GitHub >> Settings >> Git Hub Apps >> Probot app >> WebHook URL >> "mepleyprobot.localtunnel.me"  or jbjonesjropenshift.localtunnel.me (secret: openshiftprobotbranches )