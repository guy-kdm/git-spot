#!/usr/bin/env node

const g = require('simple-git/promise')()
const relateBranches = require('./utils/relate-branches')
const createBranch = require('./utils/create-branch')
const argv = require('minimist')(process.argv.slice(2))

const description = argv[0]

const IIFE = fn => fn()
IIFE(() => createWIP(argv[0]))

async function createWIP(description) {
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
        'git rebase -i origin/develop'
    )
    process.exit(1)
    // todo: ask weather to run the commands or see the commits
  }

  console.log(developStatus)
  createBranch({ from: 'develop', prefix: 'wip', description })
  // check if develop diverged from origin
}

//todo: automatically convert wip to merged if merged to develop?
