import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

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
  const configPath = path.resolve('./visual-testing.json')
  let config = defaultConfig
  try {
    config = await fs.readJSON(configPath)
    verboseLog('Reading config from visual-testing.json')
  } catch {
    const packageJson = await fs.readJSON(packagePath)
    if (!packageJson['visual-testing']) {
      verboseLog(
        'No config found. Using default config. https://github.com/romaindurand/visual-testing#readme'
      )
      return defaultConfig
    }
    config = packageJson['visual-testing']
    verboseLog('Reading config from package.json')
  }
  return config
}

const defaultConfig = {
  devices: ['laptop'],
}
