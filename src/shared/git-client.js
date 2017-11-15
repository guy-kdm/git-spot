const workingDir = process.env.GIT_SPOT_CWD || '/tmp/base/test1'
console.log('Working Dir: ', workingDir)
//todo: verify working dir is a folder and git repo
const g = require('simple-git/promise')(/* workingDir */)
const { execSync } = require('child_process')

const sharedBranches = {
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

const exec = (command, options) => {
  execSync(`git ${command} ${options}`)
}

const getBranches = () => {
  const raw = execSync(`git branch  --all --no-color`)
}

module.exports = {
  sharedBranches,
  exec,
  branches = getBranches(),
}

const createBranch = async ({ from, prefix, title, failIfExists = true }) => {
  // if prefix specified using standard format
  const branchName = prefix ? `${prefix}/${title}` : title

  const isInOrigin = Boolean(getOriginBranch(branchName))
  const isInLocal = Boolean(getLocalBranch(branchName))

  if (!isInLocal) {
    await g.branch(branchName, from)
  }

  if (!isInOrigin) {
    g.push(['--set-upstream', 'origin', branchName])
  }

  if (isInOrigin && isInLocal && failIfExists) {
    throw new Error(
      `Branch ${branchName} already exists locally and in origin.`
    )
  }
}
