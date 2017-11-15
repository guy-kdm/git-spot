#!/usr/bin/env node
const g = require('./shared/git-client')
const { getBranches } = require('./shared/repository')
const _ = require('ramda')

const forEachPromise = ({ fn, arr }) => Promise.all(arr.map(fn))
const logIfAny = (branches, msg) =>
  branches.length &&
  console.log(msg + ' ' + branches.map(b => b.name).join(', '))

//init action: fetch -a --prune
//output:
//actions:
//  created (branch for each shared branch) (before get branches)
//  pulled (all behind): [...]
//  pushed (remoteless or ahead wip / trunks): [...]
//  rebased: [branches behind deploy target where ff merge possible]
//  deleted (merged wips): [...]
//warnings:
//  behind (branches ahead of deploy target)
//  ahead (shared deployment branches ahead of origin): [...]
//  diverged (branches diverged from deploy target): [...] (bold for shared branches)
//  stale (unmerged wip branches not touched for X days): [...] -- add command to choose which to delete
//  up to date branches: [...] <- no need prob
//  regular status output? (chance to get to know it...)
//todo: verbose (with branch names, otherwise: just no of branches affected by each action)
//todo: add date since last edit to branches and sort accordingly
//todo: to avoid second script run, use head commit from the most up to date branch version (origin / local) to check if merged

const IIFE = fn => fn()

// warn for detached commits in reflog

IIFE(async () => {
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

  // 3. pulling behind branches
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

  const alreadySynced = branches.filter(
    b => b.syncStatus.relation === 'identical'
  )

  logIfAny(alreadySynced, 'Up to date:')
})
