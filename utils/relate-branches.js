#!/usr/bin/env node

const IIFE = fn => fn();

IIFE(async () => {
  const workingDir = process.env.GIT_SPOT_CWD || '~/tmp/test-git-scripts';
  let g = require('simple-git/promise')('');

  const res = await g.fetch(['--all', '--prune']);
  console.log(res);
});
