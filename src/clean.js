#!/usr/bin/env node
const g = require('./shared/git-client')
const { getBranches } = require('./shared/repository')
const _ = require('ramda')

const forEachPromise = ({ fn, arr }) => Promise.all(arr.map(fn))
const logIfAny = (branches, msg) =>
  branches.length &&
  console.log(msg + ' ' + branches.map(b => b.name).join(', '))

// validate
// WIP branches that need rebasing
// fetch all remotes like git up
//output: updated branches: [...]
//        up to date branches: [...]
//        diverging branches: [...]
//        no remote branches: [...]
//recommend fix diverged branches

const IIFE = fn => fn()

IIFE(async () => {
  // todo: move to before each script
  await g.fetch(['--all', '--prune'])

  await ensureSharedBranchesTracked()

  const branches = await getBranches()

  // 1. set upstream branches with no origin
  const noOrigin = branches.filter(b => b.syncStatus.relation === 'no remote')
  if (noOrigin.length) {
    await forEachPromise({
      arr: noOrigin,
      fn: b => g.push(['--set-upstream', 'origin', b.name]),
    })
  }

  logIfAny(noOrigin, 'Added to origin:')

  // 2. pushing ahead non deploy branches
  // {'syncStatus.relation': 'ahead', type !== 'deploy'}
  const aheadDevBranches = branches.filter(
    b => b.syncStatus.relation === 'ahead' && b.type !== 'deploy'
  )
  if (aheadDevBranches.length) {
    await forEachPromise({
      arr: aheadDevBranches,
      fn: b => g.push('origin', b.name),
    })
  }

  logIfAny(aheadDevBranches, 'Pushed:')

  //todo: add env to branch config?

  // todo: ask weather to push ahead shared branches

  // 3. pulling behind branches
  // {'syncStatus.relation': 'behind', isShared === false}
  const behindBranches = branches.filter(
    b => b.syncStatus.relation === 'behind' && !b.isShared
  )
  if (behindBranches.length) {
    await forEachPromise({
      arr: behindBranches,
      fn: b => g.pull(b.name, ['--rebase', '--ff-only']),
    })
  }

  logIfAny(behindBranches, 'Pulled:')

  // 4. handling diverging branches

  // todo! add relation to top lavel, curry whereEq to create filterBranches
  const sharedDiverged = filterBranches({
    isShared: true,
    'syncStatus.relation': 'diverged',
  })
  //todo: if any shared branch is diverged - warn
  // console.log({ behindBranches, aheadWipBranches })

  const alreadySynced = branches.filter(
    b => b.syncStatus.relation === 'identical'
  )

  logIfAny(alreadySynced, 'Up to date:')

  // todo! - if diverged from 'deployed to' - add to get branches!
  // todo! if shared branch is behind "deployTo" - warn 'pending deploy'

  //todo! prune out merged wip branches!
})

// if (branch.configType && branch.syncStatus.relation === 'behind') {
//   console.log(branch.name)
// }
//todo: automatically convert wip to merged if merged to develop?

// todo: no need to sync wip branches where origin is merged
// todo: add output - is shared branch deployed to deployTarget
