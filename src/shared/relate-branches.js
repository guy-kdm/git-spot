const g = require('./git-client')

/**
 * todo...
 */
module.exports = async function relateBranches(fromBranch, toBranch) {
  // returns a parsed list of commits that aren't in both branches history
  const diffCommits = (await g.log({
    from: fromBranch,
    to: toBranch,
  })).all

  const groupedByBranch = await groupDiffCommitsByBranch(
    fromBranch,
    toBranch,
    diffCommits
  )

  const fromAheadBy = groupedByBranch[fromBranch].length
  const toAheadBy = groupedByBranch[toBranch].length

  let status
  if (fromAheadBy > 0 && toAheadBy > 0) {
    status = 'diverged'
  } else if (fromAheadBy > 0) {
    status = 'ahead'
  } else if (toAheadBy > 0) {
    status = 'behind'
  } else {
    status = 'identical'
  }

  const result = {
    status,
    from: fromBranch,
    to: toBranch,
    fromAheadBy,
    toAheadBy,
    unsyncedCommits: groupedByBranch,
  }

  return result
}

/**
 * Grouping diffCommits to their respective branches
 */
async function groupDiffCommitsByBranch(branch1, branch2, diffCommits) {
  // using: git rev-list --left-right b1..b2
  // Output Example:
  // [ '>edfe6919dbfb90a9e917b9162f5e940925c159f4',
  //   '<b1bf3aa38f0a1dce1ac83e615c2f4a9f20cfaf10' ]
  // The first char indicates the commit's branch (b1/b2).
  const revListOutput = await g.raw([
    'rev-list',
    '--left-right',
    `${branch1}...${branch2}`,
  ])

  const emptyOutput = { [branch1]: [], [branch2]: [] }
  if (!revListOutput) return emptyOutput

  const groupedByBranch = revListOutput
    .trim()
    .split('\n')
    // grouping by branch
    .reduce((acc, commitLine) => {
      const branchIndicator = commitLine.charAt(0) // '<' or '>'
      const commitHash = commitLine.slice(1)

      const commitObj = diffCommits.find(commit => commit.hash === commitHash)

      switch (branchIndicator) {
        case '<':
          acc[branch1].push(commitObj)
          break
        case '>':
          acc[branch2].push(commitObj)
          break
      }

      return acc
    }, emptyOutput)

  return groupedByBranch
}
