const g = require('./git-client');

module.exports = async function createBranch({
  fromBranch,
  prefix,
  description,
  withTimestamp,
}) {
  const branchName = `${prefix}/${description}`;

  await g.checkoutBranch(branchName, fromBranch);

  g.getRemotes(true /*verbose*/, (err, remotes) =>
    remotes.map(({ name: remote }) => {
      if (!remote) {
        console.log(`No remotes detected, branch ${branchName} is local only.`);
        return;
      }

      // if (remotes.length > 1)
      console.log(`Setting ${branchName} in ${remote}.`);

      g.push(['--set-upstream', remote, branchName]);
    })
  );
};
