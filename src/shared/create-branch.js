const g = require('./git-client')

module.exports = async function createBranch({
  from,
  prefix,
  description,
  withTimestamp,
}) {
  const branchName = `${prefix}/${description}`

  await g.checkoutBranch(branchName, from)
  g.push(['--set-upstream', 'origin', branchName])
}
