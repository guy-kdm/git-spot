const g = require('./git-client')

// joins all non null values with '-' separator.
const join = (...strings) => strings.filter(Boolean).join('-')

module.exports = async function createBranch({
  from,
  type,
  desc,
  timestamp,
  ticket,
}) {
  const prefix = join(type, ticket)
  const branchName = `${prefix}/${desc}`

  await g.checkoutBranch(branchName, from)
  g.push(['--set-upstream', 'origin', branchName])
}
