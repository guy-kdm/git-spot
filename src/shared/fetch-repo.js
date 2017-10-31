const g = require('./shared/git-client')

module.exports = function fetchRepo() {
  const localBranches = await g.branchLocal()
  // todo: fetch shared branches without local
  console.log(localBranches)

  return g.fetch(['--all', '--prune'])
}
