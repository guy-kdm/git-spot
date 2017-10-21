const workingDir =
  process.env.GIT_SPOT_CWD || '/Users/guykedem/tmp/test-git-scripts'
console.log('Working Dir: ', workingDir)
//todo: verify working dir is a folder and git repo
const g = require('simple-git/promise')(workingDir)

g.sharedBranchesConfig = {
  trunk: ['develop'],
  qa: ['staging'],
  production: ['master'],
}

module.exports = g
