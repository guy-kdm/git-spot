const workingDir = process.env.GIT_SPOT_CWD || '/tmp/base/test'
console.log('Working Dir: ', workingDir)
//todo: verify working dir is a folder and git repo
const g = require('simple-git/promise')(workingDir)

g.sharedBranchesConfig = {
  trunk: ['develop'],
  qa: ['staging'],
  production: ['master'],
}

module.exports = g
