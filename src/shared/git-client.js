const workingDir = process.env.GIT_SPOT_CWD || '/tmp/base/test1'
console.log('Working Dir: ', workingDir)
//todo: verify working dir is a folder and git repo
const g = require('simple-git/promise')(/* workingDir */)

g.sharedBranches = {
  develop: {
    type: 'trunk',
    deployTo: 'staging',
  },
  staging: {
    type: 'deploy',
    deployTo: 'master',
  },
  master: {
    type: 'deploy',
  },
}

module.exports = g
