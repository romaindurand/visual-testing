import fs from 'fs-extra'
import path from 'path'

export function verboseLog(message) {
  const args = getArgs()
  if (!args.includes('--verbose')) return
  if (typeof message === 'string') return console.log(chalk.blue(message))
  console.log(chalk.blue(JSON.stringify(message, null, 2)))
}

export function isInteractive() {
  const args = getArgs()
  return !args.includes('--ci')
}

function getArgs() {
  return process.argv.slice(2)
}

export async function getConfig() {
  const packagePath = path.resolve('./package.json')
  const packageJson = await fs.readJSON(packagePath)
  const config = packageJson['visual-testing'] || defaultConfig
  return config
}
