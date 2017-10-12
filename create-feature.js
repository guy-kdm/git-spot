  // updating remote tracking branches
  await g.fetch(['--all', '--prune']);
  const argv = require('minimist')(process.argv.slice(2));
  
  // const workingDir = process.env.GIT_SPOT_CWD || '~/tmp/test-git-scripts';
  