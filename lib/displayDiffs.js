import { promises as fs } from 'fs'
import path from 'path'
import open from 'open'
import each from 'p-each-series'
import inquirer from 'inquirer'
import exitWithError from './exitWithError.js'
import chalk from 'chalk'

export default async function displayDiffs(
  diffPath,
  interactive,
  oldPath,
  newPath
) {
  const diffFiles = await fs.readdir(diffPath)
  const newFiles = await fs.readdir(newPath)
  //remove new screenshots that did not genertate diffs
  await each(newFiles, async (newFile) => {
    if (!diffFiles.includes(newFile)) {
      await fs.unlink(path.join(newPath, newFile))
    }
  })
  if (!interactive && diffFiles.length)
    exitWithError('Visual delta found', diffFiles)
  await each(diffFiles, async (diffFile) => {
    const diffFilePath = path.join(diffPath, diffFile)
    await open(diffFilePath)
    const answer = await inquirer.prompt({
      message: chalk.red(`Accept delta for ${diffFile} ?`),
      type: 'confirm',
      name: 'acceptDelta',
      default: false,
    })
    if (answer.acceptDelta) {
      await fs.unlink(diffFilePath)
      await fs.copyFile(
        path.join(newPath, diffFile),
        path.join(oldPath, diffFile)
      )
      await fs.unlink(path.join(newPath, diffFile))
    }
  })
  if (!diffFiles.length)
    return console.log(chalk.green('No visual delta found'))
}
