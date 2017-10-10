/**
 * t: time to rollback to (default format [HH:mm] assumes today, otherwise YYYY-MM-DD HH:mm or timestamp)
 * 
 * ALGO:
 * 1. find closest commit from before t (show commits before and after)
 * 2. (prompt: ask if to rollback to t (answers: 1. wait, show diff first, 2. yes, 3. no))
 * 3. force merge previous version with a new commit
 * 4. announce slack prompt
 */
