import each from 'p-each-series'
import pMap from 'p-map'
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
  browser,
  delay,
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

  // TODO: configurable concurrency
  await pMap(
    stories,
    async (story) => {
      const page = await browser.newPage()
      await each(devices, async (deviceName) => {
        const storyName = story.name.replace(/\//g, '-')
        bar.tick({ storyName, deviceName })
        const device = standardDevices[deviceName]
        if (!device) {
          console.log(chalk.red(`\nDevice ${deviceName} not found. Skipping.`))
          return
        }
        await page.setViewport({ width: device.width, height: device.height })
        await page.goto(`http://localhost:6006/iframe.html?id=${story.id}`)
        if (delay) {
          await page.waitForTimeout(delay)
        }
        const options = story.options
        if (options && options.delay) {
          await page.waitForTimeout(options.delay)
        }
        const filename = `${storyName}_${deviceName}.png`

        const boundingBoxes = await page.evaluate((options) => {
          // TODO: configurable selector (global + story specific)
          const docsRoot = window.document.querySelectorAll(
            '.sbdocs.sbdocs-wrapper > *'
          )
          const componentRoot = window.document.querySelectorAll('#root > *')
          const root = options?.selector
            ? window.document.querySelectorAll(options.selector)
            : window.document.querySelector('#root').hidden
            ? docsRoot
            : componentRoot
          return Array.from(root).map((el) => {
            const boundingBox = el.getBoundingClientRect()
            return {
              left: boundingBox.left,
              top: boundingBox.top,
              right: boundingBox.right,
              bottom: boundingBox.bottom,
            }
          })
        }, options)
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

        const width = rootBoundingBox.right - rootBoundingBox.left
        const height = rootBoundingBox.bottom - rootBoundingBox.top
        if (width === 0 || height === 0) {
          console.log(
            chalk.red(
              `\nStory '${story.name}' has no visible content. Skipping.`
            )
          )
          return
        }
        await page.screenshot({
          path: path.join(savePath, filename),
          clip: {
            x: rootBoundingBox.left,
            y: rootBoundingBox.top,
            width,
            height,
          },
        })
      })
      await page.close()
    },
    { concurrency: 5 }
  )
}
