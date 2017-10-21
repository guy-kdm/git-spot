const g = require('./git-client');

module.exports = async function validateRepo(fromBranch, toBranch) {};
// check if shared branches diverged

// (in case of hotfix divergment, check if hotfix pr was merged)
// develop (behind / diverged) staging - err, staging behind master - warn
// stale pr's - warn
// too many wips - warn
