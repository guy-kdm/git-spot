const inquirer = require('inquirer')
const argv = require('minimist')(process.argv.slice(2))
const R = require('ramda')

module.exports = async function prompt(question) {
  const answerFromCLI = argv[question.name]
  if (answerFromCLI) return answerFromCLI
  else return inquirer.prompt(question).then(R.prop(question.name))
}
