import { promises as fs } from 'fs'
import fse from 'fs-extra'
import path from 'path'
import each from 'p-each-series'
import inquirer from 'inquirer'
import exitWithError from './exitWithError.js'

export default async function initPath(localPath, interactive) {
  try {
    const filesInSavePath = await fs.readdir(localPath)
    if (!filesInSavePath.length) return
    const message = `Folder ${localPath} is not empty`
    if (!interactive) return exitWithError(message)
    console.log(message, filesInSavePath)
    const clearFiles = await inquirer.prompt({
      type: 'confirm',
      message: 'Would you like to remove these files ?',
      name: 'cleanPath',
    })

    if (!clearFiles.cleanPath) return
    await emptyDir(localPath, filesInSavePath)
  } catch {
    await fs.mkdir(localPath, { recursive: true })
  }
}

export async function emptyDir(dirPath, fileNames) {
  if (!fileNames) fileNames = await fs.readdir(dirPath)
  await each(fileNames, async (filename) => {
    const filePath = path.join(dirPath, filename)
    await fs.unlink(filePath)
  })
}

export async function handleGitIgnore() {
  const gitIgnorePath = path.join('.visual-testing', '.gitignore')
  const gitIgnoreExists = await fse.pathExists(gitIgnorePath)
  if (gitIgnoreExists) return
  const gitIgnoreContent = '# Visual Testing\n/temp/\n/diff/\n'
  await fse.mkdir('.visual-testing')
  await fse.writeFile(gitIgnorePath, gitIgnoreContent)
}
