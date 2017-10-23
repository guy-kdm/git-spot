#!/usr/bin/env node

const g = require('simple-git/promise')()
const relateBranches = require('./shared/relate-branches')
const createBranch = require('./shared/create-branch')
const argv = require('minimist')(process.argv.slice(2))

const IIFE = fn => fn()
IIFE(() => createWIP(argv))

// todo? if currently wip ask if finish curr or start new
// todo: if on develop and develop dirty - autostash
// todo: handle dirty WD, ask what to do
async function createWIP({ description }) {
  // updating remote tracking branches
  await g.fetch(['--all', '--prune'])

  const developStatus = await relateBranches('develop', 'origin/develop')

  //todo: might be ahead...
  if (developStatus.relation === 'diverged') {
    console.error(
      'Cannot create a WIP branch because the develop branch diverged from origin.\n' +
        'Creating a WIP branch from a stale develop branch will likely lead to nasty conflicts.' +
        'To solve this issue rebase the local develop branch to origin by running: \n ' +
        'git checkout develop\n' +
        'git rebase -i origin/develop\n' +
        'After solving...'
    )
    process.exit(1)
    // todo: ask weather to run the commands or see the commits
  }

  // todo: if existing wip by name ask if to checkout
  createBranch({ from: 'develop', prefix: 'wip', description })
}
