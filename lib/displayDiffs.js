import { promises as fs } from 'fs'
import path from 'path'
import each from 'p-each-series'
import inquirer from 'inquirer'
import exitWithError from './exitWithError.js'
import chalk from 'chalk'
import serveDiffUi from '../diff-ui/src/server/index.js'

export default async function displayDiffs(
  diffPath,
  interactive,
  oldPath,
  newPath
) {
  console.log('running displayDiffs')
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

  if (!diffFiles.length)
    return console.log(chalk.green('No visual delta found'))

  //run diff ui
  const closeDiffUiServer = await serveDiffUi(
    path.resolve(diffPath, '..'),
    4444
  )
  console.log('Diff UI is ready on http://localhost:4444')

  let diffs, stopUI
  do {
    diffs = await fs.readdir(diffPath)
    console.log(chalk.blue(`${diffs.length} diffs left`))
    stopUI = await inquirer.prompt({
      message: chalk.red(`Stop diff UI?`),
      type: 'confirm',
      name: 'stop',
      default: false,
    })
  } while (stopUI.stop === false)
  await closeDiffUiServer()

  // await each(diffFiles, async (diffFile) => {
  //   const diffFilePath = path.join(diffPath, diffFile)
  //   await open(diffFilePath)
  //   const answer = await inquirer.prompt({
  //     message: chalk.red(`Accept delta for ${diffFile} ?`),
  //     type: 'confirm',
  //     name: 'acceptDelta',
  //     default: false,
  //   })
  //   if (answer.acceptDelta) {
  //     await fs.unlink(diffFilePath)
  //     await fs.copyFile(
  //       path.join(newPath, diffFile),
  //       path.join(oldPath, diffFile)
  //     )
  //     await fs.unlink(path.join(newPath, diffFile))
  //   }
  // })
}
