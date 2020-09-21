import { promises as fs } from 'fs'
import path from 'path'
import loadImage from 'image-pixels'
import imageEqual from 'image-equal'
import each from 'p-each-series'
import puppeteer from 'puppeteer'

/**
 * Take screenshots and compare them to the previous version
 * @param {Object} parameters 
 */
export default async function startTests (parameters) {
  // check inputs
  const {
    resolutions,
    urls,
    screenshots, //TODO: rename
    interactive,
    waitForOptions,
  } = normalizeParameters(parameters)

  // take screenshots => new
  await takeScreenshots({ resolutions, urls, waitForOptions, screenshots })
  // compares old and new screenshots
  // list errors (interactive or log + error code)
}

function normalizeParameters (parameters) {
  const normalizedParameters = {}

  // TODO: add name alias to resolution (ex: mobile, tablet, desktop)
  normalizedParameters.resolutions = parameters.resolutions || ['800x600']
  
  // TODO: move to main function, with a console.error and a return
  const screenshots = parameters.screenshots
  if (!screenshots || !screenshots.oldPath || !screenshots.newPath || !screenshots.diffPath) {
    throw new Error('screenshots must be an Object({oldPath: String, newPath: String, diffPath: String})')
  }
  normalizedParameters.screenshots = screenshots

  normalizedParameters.interactive = Boolean(parameters.interactive)

  normalizedParameters.waitForOptions = parameters.waitForOptions || { type: 'timeout', value: 100 }

  return normalizedParameters
}

function takeScreenshots ({ resolutions, urls, waitForOptions, savePath }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();    
  Object.entries(urls).forEach(([ name, path ]) => {
    resolutions.forEach(resolution => {
      await page.goto(path)
      switch (waitForOptions.type) {
        // TODO: add other types cases
        case 'timeout':
          await page.waitForTimeout(waitForOptions.value)
          break;
      }
      const filename = `${name}_${resolution}.png`
      // TODO: interactive/CI mode
      console.log(`taking screenshot for ${name} (${resolution})`)
      await page.screenshot({
        path: path.join(savePath, filename),
        fullPage: true,
      })
    })
  })
}

export async function compareImages (path1, path2, pathDiff, options) {
  const [imageFileName1, imageFileName2] = await Promise.all([
    fs.readdir(path1),
    fs.readdir(path2)
  ])

  
  console.log({ imagesPath1: imageFileName1, imagesPath2: imageFileName2 })

  await each(imageFileName1, async (imagePath1, index) => {
    const imageFileName1 = path.parse(imagePath1).base
    const imagePath2 = imageFileName2.find(imagePath => {
      return path.parse(imagePath).base === imageFileName1
    })
    if (!imagePath2) {
      console.log(`Could not find ${imageFileName1} in path2`)
      return
    }
    const [image1, image2] = await loadImage.all([imagePath1, imagePath2])
    console.log({ image1, image2 })
  })
}