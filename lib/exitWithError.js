import chalk from 'chalk'

export default function exitWithError (message, values) {
  if (!values) {
    console.error(chalk.red(`ERROR: ${message}`))
  } else {
    console.error(chalk.red(`ERROR: ${message}`), values)
  }
  process.exit(1)
}
