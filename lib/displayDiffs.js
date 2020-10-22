import { promises as fs } from 'fs'
import path from 'path'
import open from 'open'
import each from 'p-each-series'
import inquirer from 'inquirer'
import exitWithError from './exitWithError.js'

export default async function displayDiffs (diffPath, interactive, oldPath, newPath) {
  const diffFiles = await fs.readdir(diffPath)
  if (!interactive && diffFiles.length) exitWithError('Visual diffs found', diffFiles)
  each(diffFiles, async diffFile => {
    const diffFilePath = path.join(diffPath, diffFile)
    await open(diffFilePath)
    const acceptDiff = await inquirer.prompt({
      type: 'confirm',
      message: 'Accept diff ?',
      name: 'diff'
    })
    if (acceptDiff) {
      await fs.unlink(diffFilePath)
      await fs.copyFile(path.join(newPath, diffFile), path.join(oldPath, diffFile))
      await fs.unlink(path.join(newPath, diffFile))
    }
  })
}
