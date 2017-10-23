#!/usr/bin/env node
const g = require('simple-git/promise')()
const relateBranches = require('./shared/relate-branches')
const createBranch = require('./shared/create-branch')
const argv = require('minimist')(process.argv.slice(2))
const inquire = require('inquirer')
const getBranches = require('./shared/get-branches')
// todo: when creating a pr branch - tag the commit with pull-request sent
// todo: handle uncommited changes uncommited
// todo: if staged changes prompt to commit with finish... msg
// todo: add option for single commit branch

const IIFE = fn => fn()
IIFE(() => finishWIP(argv))

// todo? if currently wip ask if finish curr or start new
// todo: if on develop and develop dirty - autostash
// todo: handle dirty WD, ask what to do
async function finishWIP({ merge, wipBranch }) {
  // todo: change to prior all scripts
  // updating remote tracking branches
  await g.fetch(['--all', '--prune'])
  console.log({ branches: await getBranches() })
  const wipStatus = await relateBranches('develop', 'origin/develop')

  // push wip if not yet pushed

  //todo: might be ahead...
  if (developStatus.relation === 'diverged') {
    console.error('')
    process.exit(1)
    // todo: ask weather to run the commands or see the commits
  }

  // ask weather to immediatly merge or open a pr
}
