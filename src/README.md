
 branch name convention: [prefix]/desc. prefix can be a WIP_PREFIX or a backup_prefix.  
 wip prefixes: ['ticket-[ticket_num]', 'hotfix', 'wip']
 pr prefixes:  [*-pr-[pr_num]]
 backup prefixes: ['merged', released-[DepT]', 'backup-[wip-prefix]'] (backup prefixes always end with a timestamp)
 
 deployed-branch (DepB) defaults to current branch
 deployment-target (DepT) defaults to master if on staging, otherwise to 'staging'
 
 ALGO:
 (prompt: are you sure you want to deploy to [DepT]? )
 by default DepB should allways be ahead of DepT (maybe add --force to allow it)
 anything that is not develop -> staging, staging -> master is a "hotfix deployment"
  1. (prompt: merging [branch name] is a hotfix merge? unless prefix hotfix?)
  2. if so, check if DepB is ahead or diverged from any deployment targets (other than [DepT]) and ask if to pull-request'em
 
 if not hotfix - tag DepB with released and time
 
 cont...
  3. create a backup branch named released-[DepT]-[timestamp]-[DepB]
  4. force merge branch to DepT (merge msg is backup branch name)
  5. announce to slack?
 
// git quickie stash, open a wip branch+pop, merge to develop

// repo status in prompt (say current branch needs rebasing, unmerged prs, ext... )
