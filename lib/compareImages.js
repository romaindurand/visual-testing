import loadImage from 'image-pixels'
import imageEqual from 'image-equal'
import { promises as fs } from 'fs'
import each from 'p-each-series'
import path from 'path'
import inquirer from 'inquirer'
import ProgressBar from 'progress'
import chalk from 'chalk'

import initPath from './initPath.js'

export default async function compareImages (oldPath, newPath, diffPath, interactive) {
  await initPath(diffPath, interactive)
  try {
    await fs.readdir(oldPath)
  } catch {
    await fs.mkdir(oldPath)
  }

  const [oldImageFileNames, newImageFileNames] = await Promise.all([
    fs.readdir(oldPath),
    fs.readdir(newPath)
  ])

  if (!oldImageFileNames.filter(name => name !== 'diff' && name !== 'temp').length) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      message: `No existing screenshots has been found in ${oldPath}, would you like to initialize it with current screenshots ?`,
      name: 'initScreenshots'
    })

    if (answer.initScreenshots) {
      await each(newImageFileNames, async (newImageFileName) => {
        const newImagePath = path.join(newPath, newImageFileName)
        await fs.copyFile(newImagePath, path.join(oldPath, newImageFileName))
        await fs.unlink(newImagePath)
      })
    }
    return
  }

  console.log(chalk.blue('Comparing screenshots ...'))
  const bar = new ProgressBar(`(:current/:total) [:bar] ${chalk.blue(':newImageFileName')}`, {
    total: newImageFileNames.length,
    width: 30
  })

  await each(newImageFileNames, async (newImageFileName) => {
    bar.tick({ newImageFileName })
    const oldImageFileName = oldImageFileNames.find(fileName => {
      return path.parse(fileName).base === newImageFileName
    })
    if (!oldImageFileName) {
      console.log(`Could not find ${newImageFileName} in ${oldPath}`)
      // todo: ask to use it as reference if interactive or exit with error
      return
    }

    const oldImagePath = path.join(oldPath, oldImageFileName)
    const newImagePath = path.join(newPath, newImageFileName)
    const [oldImage, newImage] = await loadImage.all([oldImagePath, newImagePath])

    imageEqual(oldImage, newImage, path.join(diffPath, oldImageFileName))
  })
}
