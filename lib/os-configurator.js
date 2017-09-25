const yaml = require ('js-yaml');
var substitute = require('token-substitute');

const openShiftRestClient = require('openshift-rest-client');

module.exports = {
  async getConfig(props) {
   try {

     var raw_config = yaml.safeLoad(fs.readFileSync('.openshift/config.yaml', 'utf8'));
     console.log(raw_config);

     // replace server, project, and token
     // ${token} = process.env.OS_SA_TOKEN
     var full_config = substitute(raw_config, Object.assign({}, props, {token:process.env.OS_SA_TOKEN, server: process.env.OS_SA_SERVER}));

     console.log(full_config);
    } catch (err) {
      throw err;
    }
    return full_config;
 },

 async getClient(props){
   const ocRest = openShiftRestClient(getConfig(props));
   return ocRest;
 }
};
