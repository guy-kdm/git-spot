const g = require('./git-client')
const relateBranches = require('./relate-branches')
// returns branches with relations (diverged / identical / ahead / behind) + relevant-commits
// returns branches with origin, relation
// according to a selector (prefix, time, branch, ext...)

const branchSummaryToBranchArray = summary => {
  return Object.values(summary.branches)
}

module.exports = async function getBranches() {
  // get all branches
  const localBranches = branchSummaryToBranchArray(await g.branchLocal())
  const all = branchSummaryToBranchArray(await g.branch())

  await Promise.all(
    // match each local branch with its origin tracking branch
    localBranches.map(async branch => {
      const remote = all.find(b => b.name === 'remotes/origin/' + branch.name)
      branch.origin = remote
      branch.syncStatus = await relateBranches(branch.name, remote.name)
    })
  )

  // add prefix and description from the branch naming convention
  localBranches.forEach(async branch => {
    const [prefix, description] = branch.name.split('/')

    if (!description) {
      // e.g. develop, master, non standard name
      branch.description = prefix
    } else {
      Object.assign(branch, { prefix, description })
    }
  })

  return localBranches
}
