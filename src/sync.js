const g = require('./shared/git-client')
const getBranches = require('./shared/get-branches')

const forEachPromise = ({ fn, arr }) => Promise.all(arr.map(fn))

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
  await g.fetch(['--all', '--prune'])

  const branches = (await getBranches()).all

  // 1. set upstream branches with no origin
  const noOrigin = branches.filter(b => b.syncStatus.relation === 'no remote')
  if (noOrigin.length) {
    console.log(`Adding to remote: ${noOrigin.map(b => b.name).join(', ')}`)

    await forEachPromise({
      arr: noOrigin,
      fn: b => g.push(['--set-upstream', 'origin', b.name]),
    })
  }

  // 2. updating behind branches
  // todo! if deployment branch behind - don't push!
  const behindBranches = branches.filter(
    b => b.syncStatus.relation === 'behind'
  )
  if (behindBranches.length) {
    console.log(`Pulling: ${behindBranches.map(b => b.name).join(', ')}`)
    await forEachPromise({
      arr: behindBranches,
      fn: b => g.pull(b.name, ['--rebase', '--ff-only']),
    })
  }

  // 3. pushing ahead wip branches
  const aheadWipBranches = branches.filter(
    b => b.syncStatus.relation === 'ahead' && !b.sharedBranchConfig
  )
  if (aheadWipBranches.length) {
    console.log(`Pushing: ${aheadWipBranches.map(b => b.name).join(', ')}`) // todo...
    await forEachPromise({
      arr: aheadWipBranches,
      fn: b => g.push('origin', b.name),
    })
  }

  // 4. handling diverging branches

  //todo: if any shared branch is diverged - warn
  // console.log({ behindBranches, aheadWipBranches })

  const alreadySynced = branches.filter(
    b => b.syncStatus.relation === 'identical'
  )
  // todo: remove?
  console.log(`Up to date: ${alreadySynced.map(b => b.name).join(', ')}`)
})

// if (branch.configType && branch.syncStatus.relation === 'behind') {
//   console.log(branch.name)
// }
//todo: change /util to /shared, add /src
//todo: automatically convert wip to merged if merged to develop?
