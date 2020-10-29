import { promises as fs } from 'fs'
import path from 'path'
import open from 'open'
import each from 'p-each-series'
import inquirer from 'inquirer'
import exitWithError from './exitWithError.js'
import { emptyDir } from './initPath.js'
import chalk from 'chalk'

export default async function displayDiffs (diffPath, interactive, oldPath, newPath) {
  const diffFiles = await fs.readdir(diffPath)
  if (!interactive && diffFiles.length) exitWithError('Visual delta found', diffFiles)
  await each(diffFiles, async diffFile => {
    const diffFilePath = path.join(diffPath, diffFile)
    await open(diffFilePath)
    const answer = await inquirer.prompt({
      message: chalk.red(`Accept delta for ${diffFile} ?`),
      type: 'confirm',
      name: 'acceptDelta',
      default: false
    })
    if (answer.acceptDelta) {
      await fs.unlink(diffFilePath)
      await fs.copyFile(path.join(newPath, diffFile), path.join(oldPath, diffFile))
      await fs.unlink(path.join(newPath, diffFile))
    }
  })
  await emptyDir(newPath)
  if (!diffFiles.length) return console.log(chalk.green('No visual delta found'))
}
