#!/usr/bin/env node

const g = require('simple-git/promise')()
const relateBranches = require('./shared/relate-branches')
const createBranch = require('./shared/create-branch')
const prompt = require('./shared/prompt')
const argv = require('minimist')(process.argv.slice(2))
const _ = require('ramda')

const IIFE = fn => fn()
const isNumberOrEmpty = input => input === '' || !isNaN(Number(input))

IIFE(() => createWIP(argv))
// todo? if currently wip ask if finish curr or start new
// todo: if on develop and develop dirty - autostash
// todo: handle dirty WD, ask what to do
async function createWIP() {
  //todo: if on a deployment branch and is dirty, suggest hotfix

  // updating remote tracking branches
  const ticket = await prompt({
    type: 'input',
    name: 'ticket',
    message: 'Ticket number',
    validate: input =>
      isNumberOrEmpty(input) || 'Please enter a number (or enter to skip).',
  })

  const title = await prompt({
    type: 'input',
    name: 'title',
    message: 'Description',
    validate: input => input.length > 2 || 'Please enter a brief description.',
  })

  const developStatus = await relateBranches('develop', 'origin/develop')

  //todo: add tests, change text
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
  createBranch({ from: 'develop', type: 'wip', desc, ticket })
}
