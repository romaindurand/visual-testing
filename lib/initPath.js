import { promises as fs } from 'fs'
import path from 'path'
import each from 'p-each-series'
import inquirer from 'inquirer'

import exitWithError from './exitWithError.js'

export default async function initPath (localPath, interactive) {
  try {
    const filesInSavePath = await fs.readdir(localPath)
    if (!filesInSavePath.length) return
    const message = `Folder ${localPath} is not empty`
    if (!interactive) return exitWithError(message)
    console.log(message, filesInSavePath)
    const clearFiles = await inquirer.prompt({
      type: 'confirm',
      message: 'Would you like to remove these files ?',
      name: 'cleanPath'
    })

    if (!clearFiles) return
    await each(filesInSavePath, async filename => {
      const filePath = path.join(localPath, filename)
      await fs.unlink(filePath)
      console.log(`Removed ${filePath}`)
    })
  } catch {
    await fs.mkdir(localPath)
  }
}
