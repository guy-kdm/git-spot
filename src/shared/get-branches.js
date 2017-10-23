const g = require('./git-client')
const relateBranches = require('./relate-branches')
const exportScriptOrModule = require('./export-script-or-module')
const R = require('ramda')

exportScriptOrModule(getBranches, module)

/**
 * Returns a formated branches object with all of 
 * git-spot's convention props.
 */
async function getBranches() {
  const localBranches = await getLocalBranches()

  return {
    all: localBranches,
    current: localBranches.find(b => b.current),
    ofType(type) {
      return this.all.filter(b => b.type === type)
    },
  }
}

async function getLocalBranches() {
  const localBranches = branchSummaryToBranchArray(await g.branchLocal())
  const allBranches = branchSummaryToBranchArray(await g.branch())

  await Promise.all(
    // match each local branch with its origin tracking branch
    localBranches.map(async branch => {
      const originBranch = allBranches.find(
        b => b.name === 'remotes/origin/' + branch.name
      )

      if (originBranch) {
        branch.origin = originBranch
        branch.syncStatus = await relateBranches(branch.name, originBranch.name)
      }
    })
  )

  // add prefix and description from the branch naming convention
  // add branch type from branches config
  // todo: add timestamp if any
  localBranches.forEach(async branch => {
    const [prefix, desc] = branch.name.split('/')

    if (!desc) {
      // e.g. develop, master, non standard name
      branch.desc = prefix
      branch.type = findBranchConfig(branch.name) || null
    } else {
      Object.assign(branch, { type: prefix, desc })
    }
  })

  return localBranches
}

function branchSummaryToBranchArray(summary) {
  return Object.values(summary.branches)
}

const findBranchConfig = branchName => {
  return Object.keys(g.sharedBranchesConfig).find(key =>
    g.sharedBranchesConfig[key].includes(branchName)
  )
}