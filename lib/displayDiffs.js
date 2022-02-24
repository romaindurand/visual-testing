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
  console.log(`Found ${diffFiles.length} visual delta(s)`)
  await serveDiffUi(path.resolve(diffPath, '..'), 4444)
  console.log('Diff UI is ready on http://localhost:4444')
}
