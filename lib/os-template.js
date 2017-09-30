const substitute = require('token-substitute');

module.exports = {
  async fetchTemplates(context) {
    // TODO: This could be simplified with an array and a loop
    let ac = {raw: {}};
    ac.raw.bc = await context.loadJSON('infra/bc.json');
    ac.raw.dc = await context.loadJSON('infra/dc.json');
    ac.raw.imagestream = await context.loadJSON('infra/imagestream.json');
    ac.raw.routes = await context.loadJSON('infra/route.json');
    ac.raw.svc = await context.loadJSON('infra/svc.json');

  	return ac;
  },

   updateTemplates(ac, context) {
    for(config_key in ac.raw){
      ac[config_key] = this.updateTemplate(ac.raw[config_key], context);
    }

    return ac;
  },

  updateTemplate(template, context){
    const pullrequestnumber =  context.payload.number;
    const branchname = context.payload.pull_request.head.ref;
    const giturl = context.payload.pull_request.head.repo.git_url;
    template.metadata.annotations = {"openshift.io/generated-by" : "probot-branches"};
    return substitute(template, {tokens: Object.assign({}, context.openshift_props, {'git-home':giturl,'branch-name':branchname})});
  },

   canary_deploy(ac){

       	ac.route.spec.alternateBackends[0].name=ac.route.metadata.name;
       	ac.route.spec.alternateBackends[0].weight=10
       	ac.route.spec.to.weight=90
       	ac.route.spec.host="pullrequest-" + pullrequest_id + "-" + ocp_myphp_route.spec.host;
   }
}
