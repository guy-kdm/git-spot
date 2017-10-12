#!/usr/bin/env node

const workingDir = process.env.GIT_SPOT_CWD || '~/tmp/test-git-scripts';
let g = require('simple-git/promise')();
const IIFE = fn => fn();

IIFE(async () => {
  // updating remote tracking branches
  const res = await g.fetch(['--all', '--prune']);

  const branches = await g.branchLocal();

  const l = await g.revparse();
  console.log(l);
});
