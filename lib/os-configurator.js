const yaml = require ('js-yaml');
const fs = require('fs');
const substitute = require('token-substitute');

const openShiftRestClient = require('openshift-rest-client');

module.exports = {
   getConfig(props) {
     try {
       var raw_config = yaml.safeLoad(fs.readFileSync('.openshift/config.yaml', 'utf8'));

       var full_config = substitute(raw_config, {tokens:

       Object.assign({}, props, {'token':process.env.OS_SA_TOKEN, 'server': process.env.OS_SA_SERVER})});
      } catch (err) {
        throw err;
      }
    return full_config;
 },

 async getClient(props){
   const ocRest = await openShiftRestClient(this.getConfig(props), {request:{strictSSL:false}});
   return ocRest;
 }
};
