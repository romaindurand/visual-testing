import puppeteer from 'puppeteer'
import each from 'p-each-series'
import chalk from 'chalk'
import path from 'path'
import ProgressBar from 'progress'

import initPath from './initPath.js'

export default async function takeScreenshots ({ resolutions, urls, savePath, interactive }) {
  await initPath(savePath, interactive)

  console.log(chalk.blue('Starting chrome instance ...'))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  console.log(chalk.blue('Taking screenshots ...'))
  const bar = new ProgressBar(`(:current/:total) [:bar] ${chalk.blue(':urlName (:deviceName)')}`, {
    total: urls.length * Object.keys(resolutions).length,
    width: 30
  })

  // TODO: batch ?
  await each(urls, async ({ name: urlName, url, options }) => {
    await each(Object.entries(resolutions), async ([deviceName, deviceWidth]) => {
      await page.setViewport({ width: deviceWidth, height: 600 })
      await page.goto(url)
      // configurable default timeout ?
      // page.waitForTimeout(100)
      if (options && options.waitFor) {
        const waitForOptions = options.waitFor
        switch (waitForOptions.type) {
          // TODO: add other types cases
          case 'timeout':
            await page.waitForTimeout(waitForOptions.value)
            break
        }
      }
      const filename = `${urlName}_${deviceName}.png`
      bar.tick({ urlName, deviceName })
      await page.screenshot({
        path: path.join(savePath, filename),
        fullPage: true
      })
    })
  })

  await browser.close()
  console.log(chalk.blue('Chrome instance closed'))
}
