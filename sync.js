const g = require('./utils/git-client')
const getBranches = require('./utils/get-branches')

// validate
// WIP branches that need rebasing
// fetch all remotes like git up
//output: updated branches: [...]
//        up to date branches: [...]
//        diverging branches: [...]
//        no remote branches: [...]
//recommend fix diverged branches or branches with no remote
const IIFE = fn => fn()

IIFE(async () => {
  const branches = await getBranches()
  console.log({ syncSts: branches.map(b => b.syncStatus) })
  // each behind branch - rebase to origin
  const behindBranches = branches.filter(
    b => b.syncStatus.relation === 'behind'
  )

  // each wip ahead branch - push
  const aheadWipBranches = branches.filter(
    b => b.syncStatus.relation === 'ahead' && b.prefix === 'wip'
  )

  //todo: if any shared branch is behind - warn
  console.log({ behindBranches, aheadWipBranches })
})
