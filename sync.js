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
  // each wip ahead branch - push
  // const aheadWipBranches = branches.filter(
  //   b => b.syncStatus.relation === 'ahead' && b.prefix === 'wip'
  // )

  // todo: deal with no remote origin...

  // 1. set upstream branches with no origin
  const noOrigin = branches.filter(b => !b.origin)
  if (noOrigin.length) {
    console.log(
      //todo: add branches list to log
      `Setting local only branches in origin, so you'll have them backed up.`
    )

    noOrigin.forEach(b => g.push(['--set-upstream', 'origin', b.name]))
  }

  // 2. updating behind branches
  const behindBranches = branches.filter(
    b => b.syncStatus.relation === 'behind'
  )
  if (behindBranches.length) {
    behindBranches.forEach(b => {
      // repo assumed to be up to date with origin (so it'll be a ff merge)
      g.mergeFromTo(b.origin.name, b.name)
    })
  }

  // 3. pushing ahead wip branches
  const aheadWipBranches = branches.filter(
    b => b.syncStatus.relation === 'ahead' && !b.sharedBranchConfig
  )
  if (aheadWipBranches.length) {
    console.log('Pushing ahead branches') // todo...
    aheadWipBranches.forEach(b => g.push('origin', b.name))
  }

  // 4. handling diverging branches

  // todo: each behind wip branch - rebase to origin / check if already merged /
  // const behindBranches = branches.filter(
  //   b => b.syncStatus.relation === 'behind'
  // )

  //todo: if any shared branch is behind - warn
  // console.log({ behindBranches, aheadWipBranches })
})

// if (branch.configType && branch.syncStatus.relation === 'behind') {
//   console.log(branch.name)
// }
//todo: change /util to /shared, add /src
