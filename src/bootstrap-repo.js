#!/usr/bin/env node

const relateBranches = require('./shared/relate-branches')
const createBranch = require('./shared/create-branch')
const argv = require('minimist')(process.argv.slice(2))
const tmp = require('tmp-promise')
const promisify = require('promisify-node')
const fs = promisify('fs')

if (require.main === module) {
  console.log('called directly')
} else {
  console.log('required as a module')
}

module.exports = async function bootstrapRepo({ name, parentDir }) {
  // create a develop, staging, master branch
  // if (!isForTesting) {
  //   //todo!
  //   console.error('NOT IMPL')
  //   process.exit(1)\
  // }

  await fs.mkdir(parentDir + '/local')
  await fs.mkdir(parentDir + '/origin')
  const g = require('simple-git/promise')()
}
