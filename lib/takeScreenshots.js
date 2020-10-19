import puppeteer from 'puppeteer'
import each from 'p-each-series'
import chalk from 'chalk'
import path from 'path'

import initPath from './initPath.js'

export default async function takeScreenshots ({ resolutions, urls, waitForOptions, savePath, interactive }) {
  await initPath(savePath, interactive)

  console.log(chalk.blue('Starting chrome instance ...'))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // TODO: batch ?
  await each(Object.entries(urls), async ([name, url]) => {
    await each(resolutions, async resolution => {
      const [width, height] = resolution.split('x').map(size => Number(size))
      await page.setViewport({ width, height })
      await page.goto(url)
      switch (waitForOptions.type) {
        // TODO: add other types cases
        case 'timeout':
          await page.waitForTimeout(waitForOptions.value)
          break
      }
      const filename = `${name}_${resolution}.png`
      // TODO: interactive/CI mode
      console.log(chalk.blue(`taking screenshot for ${name} (${resolution})`))
      await page.screenshot({
        path: path.join(savePath, filename),
        fullPage: true
      })
    })
  })

  await browser.close()
}
