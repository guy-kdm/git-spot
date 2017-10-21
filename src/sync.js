const g = require('./utils/git-client')
const getBranches = require('./utils/get-branches')

const forEachPromise = async (fn, arr) => await Promise.all(arr.map(fn))

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

    //todo: delete if works- noOrigin.forEach(b => g.push(['--set-upstream', 'origin', b.name]))
    await forEachPromise(noOrigin, b =>
      g.push(['--set-upstream', 'origin', b.name])
    )
  }

  // 2. updating behind branches
  const behindBranches = branches.filter(
    b => b.syncStatus.relation === 'behind'
  )
  if (behindBranches.length) {
    await forEachPromise(behindBranches, b =>
      g.pull(b.name, ['--rebase', '--ff-only'])
    )
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
  //todo: if any shared branch is diverged - warn
  // console.log({ behindBranches, aheadWipBranches })
})

// if (branch.configType && branch.syncStatus.relation === 'behind') {
//   console.log(branch.name)
// }
//todo: change /util to /shared, add /src
//todo: automatically convert wip to merged if merged to develop?
