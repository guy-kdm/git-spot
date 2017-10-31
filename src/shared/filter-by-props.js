const _ = require('ramda')
const flatten = require('flat')

/**
 * Returns elements where all filterObj props exist with an equal value.  
 * Similar to Ramda's whereEq but also allows for a flat spec obj {'a.b': 4} instead of {a: {b: 4}}
 */
function filterBy(list, specObj = {}) {
  const flatSpec = Object.assign({}, flatten(specObj))
  const predicates = Object.keys(flatSpec).map(prop =>
    _.eqProps(prop, flatSpec)
  )

  return list.filter(_.pipe(flatten, _.allPass(predicates)))
}

module.exports = _.curry(filterBy)
