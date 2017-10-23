const argv = require('minimist')(process.argv.slice(2))

/**
 * Implements a convention by which a function that accepts a single object as input 
 * can either be normally required or invoked as a script, 
 * with the script's argv constructing the input object 
 */
module.exports = (fn, scriptModule) => {
  // scriptModule is being invoked as script
  if (require.main === scriptModule) {
    // injecting cmd args as params
    const result = fn(argv)
    if (result) {
      if (result.then) {
        result.then(result => (console.log({ result }), result))
      } else {
        console.log({ result })
      }
    }
  } else {
    scriptModule.exports = fn
  }
}
