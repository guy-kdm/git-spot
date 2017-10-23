#!/usr/bin/env node
const g = require('simple-git/promise')()
const relateBranches = require('./shared/relate-branches')
const createBranch = require('./shared/create-branch')
const argv = require('minimist')(process.argv.slice(2))
const prompt = require('./shared/prompt')
const getBranches = require('./shared/get-branches')
// todo: when creating a pr branch - tag the commit with pull-request sent
// todo: handle uncommited changes uncommited
// todo: if staged changes prompt to commit with finish... msg
// todo: add option for single commit branch
//todo:   await g.fetch(['--all', '--prune'])

const IIFE = fn => fn()
IIFE(() => finishWIP(argv))

// todo? if currently wip ask if finish curr or start new
// todo: if on develop and develop dirty - autostash
// todo: handle dirty WD, ask what to do
async function finishWIP({ merge, wipBranch }) {
  const wipStatus = await relateBranches('develop', 'origin/develop')

  // todo: if ahead?
  // todo: if dirty WD?

  // updating remote tracking branches
  // push wip if not yet pushed

  // todo: if behind or diverged develop - rebase

  const mergeType = prompt({
    type: 'list',
    name: 'mergeType',
    message: 'Open a pull request or merge directly to develop',
    choices: ['PR', 'Merge directly'],
  })

  console.log(mergeType)
  // ask wether to immediatly merge or open a pr
}
