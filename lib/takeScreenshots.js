import each from 'p-each-series'
import chalk from 'chalk'
import path from 'path'
import ProgressBar from 'progress'
import standardDevices from './devices.js'

import initPath from './initPath.js'

export default async function takeScreenshots({
  devices,
  stories,
  savePath,
  interactive,
  page,
}) {
  await initPath(savePath, interactive)

  console.log(chalk.blue('Taking screenshots ...'))
  const bar = new ProgressBar(
    `(:current/:total) [:bar] ${chalk.blue(':storyName (:deviceName)')}`,
    {
      total: stories.length * Object.keys(devices).length,
      width: 30,
    }
  )

  // TODO: batch ?
  await each(stories, async (story) => {
    await each(devices, async (deviceName) => {
      const storyName = story.name.replace(/\//g, '-')
      bar.tick({ storyName, deviceName })
      const device = standardDevices[deviceName]
      if (!device) {
        console.log(chalk.red(`Device ${deviceName} not found. Skipping.`))
        return
      }
      const { width, height } = device
      await page.setViewport({ width, height })
      await page.goto(`http://localhost:6006/iframe.html?id=${story.id}`)
      const options = story.options
      if (options && options.delay) {
        await page.waitForTimeout(options.delay)
      }
      const filename = `${storyName}_${deviceName}.png`

      const boundingBoxes = await page.evaluate(() => {
        // TODO: configurable selector (global + story specific)
        return Array.from(window.document.querySelectorAll('#root > *')).map(
          (el) => {
            const boundingBox = el.getBoundingClientRect()
            return {
              left: boundingBox.left,
              top: boundingBox.top,
              right: boundingBox.right,
              bottom: boundingBox.bottom,
            }
          }
        )
      })
      const rootBoundingBox = boundingBoxes.reduce(
        (memo, boundingBox) => {
          const { left, top, right, bottom } = boundingBox
          return {
            left: Math.min(left, memo.left),
            top: Math.min(top, memo.top),
            right: Math.max(right, memo.right),
            bottom: Math.max(bottom, memo.bottom),
          }
        },
        {
          left: Infinity,
          top: Infinity,
          right: 0,
          bottom: 0,
        }
      )
      await page.screenshot({
        path: path.join(savePath, filename),
        clip: {
          x: rootBoundingBox.left,
          y: rootBoundingBox.top,
          width: rootBoundingBox.right - rootBoundingBox.left,
          height: rootBoundingBox.bottom - rootBoundingBox.top,
        },
      })
    })
  })
}
