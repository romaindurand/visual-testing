import { promises as fs } from 'fs'
import path from 'path'
import open from 'open'
import each from 'p-each-series'
import inquirer from 'inquirer'
import exitWithError from './exitWithError.js'
import { emptyDir } from './initPath.js'

export default async function displayDiffs (diffPath, interactive, oldPath, newPath) {
  const diffFiles = await fs.readdir(diffPath)
  if (!interactive && diffFiles.length) exitWithError('Visual diffs found', diffFiles)
  await each(diffFiles, async diffFile => {
    const diffFilePath = path.join(diffPath, diffFile)
    await open(diffFilePath)
    const acceptDiff = await inquirer.prompt({
      type: 'confirm',
      message: 'Accept diff ?',
      name: 'diff',
      default: false
    })
    if (acceptDiff.diff) {
      await fs.unlink(diffFilePath)
      await fs.copyFile(path.join(newPath, diffFile), path.join(oldPath, diffFile))
      await fs.unlink(path.join(newPath, diffFile))
    }
  })
  await emptyDir(newPath)
}
