import { promises as fs } from 'fs'
import path from 'path'
import loadImage from 'image-pixels'
import imageEqual from 'image-equal'
import each from 'p-each-series'
import puppeteer from 'puppeteer'
import chalk from 'chalk'
import inquirer from 'inquirer'

/**
 * Take screenshots and compare them to the previous version
 * @param {Object} parameters
 * @param {String[]|Object[]}
 */
export default async function startTests ({
  resolutions,
  urls,
  screenshots, // TODO: find better API or names for screenshots paths
  interactive,
  waitForOptions,
}) {
  console.log('given parameters', {
    resolutions,
    urls,
    screenshots,
    interactive,
    waitForOptions,
  })
  // check inputs
  ;({
    resolutions,
    urls,
    screenshots,
    interactive,
    waitForOptions,
  } = normalizeParameters({
    resolutions,
    urls,
    screenshots,
    interactive,
    waitForOptions,
  }))
  console.log('normalized parameters', {
    resolutions,
    urls,
    screenshots,
    interactive,
    waitForOptions,
  })

  // take screenshots => new
  await takeScreenshots({
    resolutions,
    urls,
    waitForOptions,
    savePath: screenshots.newPath,
    interactive,
  })
  // compares old and new screenshots
  console.log({screenshots})
  compareImages(screenshots.oldPath, screenshots.newPath, screenshots.diffPath, interactive)
  // list errors (interactive or log + error code)
}

function normalizeParameters (parameters) {
  const normalizedParameters = {}

  // TODO: add name alias to resolution (ex: mobile, tablet, desktop)
  // must work with an Number[] or an Object
  normalizedParameters.resolutions = parameters.resolutions.map(resolution => {
    const [width, height] = resolution.split('x')
    if (width < 400 || height < 417) {
      console.log(chalk.yellow('Warning: Minimum resolution is 400x417'))
      const resizedResolution = `${Math.max(width, 400)}x${Math.max(height, 417)}`
      console.log(chalk.yellow(`resolution ${resolution} will be resized as ${resizedResolution}\n`))
      return resizedResolution
    }
    return resolution
  }) || [800]
  
  const screenshots = parameters.screenshots
  if (!screenshots || !screenshots.oldPath || !screenshots.newPath || !screenshots.diffPath) {
    exitWithError('screenshots must be an Object({oldPath: String, newPath: String, diffPath: String})')
  }
  
  // TODO: accept an array of Strings and create name from url
  if (!parameters.urls || !Object.entries(parameters.urls).every(([key, value]) => (typeof key === 'string' && typeof value === 'string'))) {
    exitWithError(`urls parameter must be an Object({screenshotName: 'url to capture', screenshotName2: 'an other url})`, parameters.urls)
  }
  normalizedParameters.urls = parameters.urls

  normalizedParameters.screenshots = screenshots

  normalizedParameters.interactive = Boolean(parameters.interactive)

  normalizedParameters.waitForOptions = parameters.waitForOptions || { type: 'timeout', value: 100 }

  return normalizedParameters
}

async function initSavePath (savePath, interactive) {
  try {
    const filesInSavePath = await fs.readdir(savePath)
    if (!filesInSavePath.length) return
    // TODO: interactive, list files and ask to clean
    const message = `Folder ${savePath} is not empty`
    if (interactive) { // TODO: invert condition
      console.log(message, filesInSavePath)
      const clearFiles = await inquirer.prompt({
        type: 'confirm',
        message: 'Would you like to remove these files ?',
        name: 'cleanSavePath'
      })

      if (!clearFiles) return
      await each(filesInSavePath, async filename => {
        const filePath = path.join(savePath, filename)
        await fs.unlink(filePath)
        console.log(`Removed ${filePath}`)
      })
      return
    }
    exitWithError(message)
  } catch {
    await fs.mkdir(savePath)
  }
}

async function initDiffPath (diffPath, interactive) {
  try {
    const files = await fs.readdir(diffPath)
    if (files.length === 0) return


  } catch {
    await fs.mkdir(diffPath)
  }

}

async function takeScreenshots ({ resolutions, urls, waitForOptions, savePath, interactive }) {

  await initSavePath(savePath, interactive)

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // TODO: batch ?
  await each(Object.entries(urls), async ([ name, url ]) => {
    await each(resolutions, async resolution => {
      const [width, height] = resolution.split('x').map(size => Number(size))
      await page.setViewport({ width, height })
      await page.goto(url)
      switch (waitForOptions.type) {
        // TODO: add other types cases
        case 'timeout':
          await page.waitForTimeout(waitForOptions.value)
          break;
      }
      const filename = `${name}_${resolution}.png`
      // TODO: interactive/CI mode
      console.log(chalk.blue(`taking screenshot for ${name} (${resolution})`))
      await page.screenshot({
        path: path.join(savePath, filename),
        fullPage: true,
      })
    })
  })

  await browser.close()
}

function exitWithError(message, values) {
  if (!values) {
    console.error(chalk.red(`ERROR: ${message}`))
  } else {
    console.error(chalk.red(`ERROR: ${message}`), values)
  }
  process.exit(1)
}

export async function compareImages (path1, path2, pathDiff, interactive) {
  await initDiffPath(pathDiff, interactive)

  const [imageFileNames1, imageFileNames2] = await Promise.all([
    fs.readdir(path1),
    fs.readdir(path2)
  ])

  await each(imageFileNames1, async (imageFileName1, index) => {
    const imageFileName2 = imageFileNames2.find(fileName => {
      return path.parse(fileName).base === imageFileName1
    })
    if (!imageFileName2) {
      console.log(`Could not find ${imageFileName1} in ${path2}`)
      return
    }

    const imagePath1 = path.join(path1, imageFileName1)
    const imagePath2 = path.join(path2, imageFileName2)
    const [image1, image2] = await loadImage.all([imagePath1, imagePath2])

    imageEqual(image1, image2, path.join(pathDiff, imageFileName1))
  })
}