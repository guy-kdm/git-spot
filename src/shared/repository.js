const g = require('./git-client')
const relateBranches = require('./relate-branches')
const { execSync } = require('child_process')
const _ = require('ramda')

// updating repo from remote once per script
_.once(() => execSync('git fetch --all --prune'))()

// repo status is branches and commits without a branch
//  let currBranchName = await g.revparse(['--abbrev-ref', 'HEAD'])

//Object.values((await g.branchLocal()).branches)

const _branches = async () => {
  return _isCacheValid
    ? _allranches
    : Object.values((await g.branchLocal()).branches)
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

// taken from
const branchRegex = /^(\*?\s+)(\S+)\s+([a-z0-9]+)\s(.*)$/

//todo: add headCommit prop for the most up to date commit (local / origin)
const getBranches = async () => {
  const branches = Object.values((await g.branch()).branches)

  // match each local branch with its origin tracking branch
  await Promise.all(
    branches.map(async branch => {
      const originBranch = _allBranches.find(originBranch(branch))

      branch.originRelation = !originBranch
        ? { relation: 'no remote' }
        : await relateBranches(branch.name, originBranch.name)

      // some sugary convenience props
      branch.origin = originBranch
      branch.syncStatus = branch.originRelation.status
    })
  )

  //todo: freeze result object for immutability

  // add prefix and title from the branch naming convention
  // add branch type from branches config
  // todo: add timestamp if any
  branches.forEach(async branch => {
    const [prefix, title] = branch.name.split('/')

    // if name not in prefix/title format (e.g. develop, master)
    // todo: change to if sharedBranches.includes otherwise treat as wip
    if (!title) {
      branch.title = prefix

      const config = g.sharedBranches[branch.title]
      if (config) {
        branch.type = config.type
        branch.sharedBranchConfig = config
      }
    } else {
      Object.assign(branch, { type: prefix, title })
    }
  })

  return branches
}
const getOriginBranch = async name =>
  (await getBranches()).find(b => b.name === 'remotes/origin/' + name)
const getLocalBranch = async name =>
  (await getBranches()).find(b => b.name === name)

module.exports = async () => {
  return {
    createBranch,
    getBranches,
  }
}

// todo! ensure shared branches exist and tracked
async function ensureSharedBranchesTracked() {
  // make sure create branch don't create if exists
  await forEachPromise({
    arr: sharedBrancheNames,
    fn: name =>
      createBranch({
        from: 'origin/master',
        title: name,
        failIfExists: false,
      }),
  })
}
