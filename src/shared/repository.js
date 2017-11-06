const g = require('./git-client')
const relateBranches = require('./relate-branches')

//  let currBranchName = await g.revparse(['--abbrev-ref', 'HEAD'])
let _localBranches
let _allBranches
let _isCacheValid = false
const init = async () => {
  if (!_isCacheValid) {
    await g.fetch(['--all', '--prune'])
    _localBranches = Object.values((await g.branchLocal()).branches)
    _allBranches = Object.values((await g.branch()).branches)

    _isCacheValid = true
  }
}

const getOriginBranch = name =>
  _allBranches.find(b => b.name === 'remotes/origin/' + name)
const getLocalBranch = name => _localBranches.find(b => b.name === name)

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

const getBranches = async () => {
  // match each local branch with its origin tracking branch
  await Promise.all(
    _localBranches.map(async branch => {
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

  // add prefix and description from the branch naming convention
  // add branch type from branches config
  // todo: add timestamp if any
  _localBranches.forEach(async branch => {
    const [prefix, title] = branch.name.split('/')

    // if name not in prefix/title format (e.g. develop, master)
    // todo: change to if sharedBranches.includes otherwise treat as wip
    if (!title) {
      branch.title = prefix

      const config = g.sharedBranches[branch.desc]
      if (config) {
        branch.type = config.type
        branch.sharedBranchConfig = config
      }
    } else {
      Object.assign(branch, { type: prefix, title })
    }
  })

  return _localBranches
}

module.exports = async () => {
  await init()
  return {
    createBranch,
    getBranches,
  }
}

// todo! ensure shared branches exist and tracked
async function ensureSharedBranchesTracked() {
  // todo: switch to call create branch and track,
  // make sure create branch don't create if exists
  const sharedBrancheNames = Object.keys(g.sharedBranches)

  await forEachPromise({
    arr: sharedBrancheNames,
    fn: name =>
      createBranch({
        from: 'origin/master',
        title: name,
        failIfExists: false,
      }),
  })

  // Ensuring all shared branches have a local tracking branch
  // by checking them out
  await forEachPromise({
    arr: sharedBrancheNames,
    fn: b => g.checkoutBranch(b),
  })

  await g.checkoutBranch(currBranchName)
}
