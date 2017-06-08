#!/bin/bash

# create openshift-config.json from https://www.npmjs.com/package/openshift-rest-client

curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -


sudo npm install npm@latest -g


npm install --save


npm start
