import path from 'path'
import compareImages from './lib/compareImages.js'
import displayDiffs from './lib/displayDiffs.js'
import normalizeParameters from './lib/normalizeParameters.js'
import takeScreenshots from './lib/takeScreenshots.js'

/**
 * Take screenshots and compare them to the previous version
 * @param {Object} parameters
 * @param {String[]|Object[]}
 */
export default async function startTests ({
  resolutions,
  urls,
  screenshots,
  interactive,
  waitForOptions
}) {
  ({
    resolutions, urls, screenshots, interactive, waitForOptions
  } = normalizeParameters({
    resolutions, urls, screenshots, interactive, waitForOptions
  }))

  const tempPath = path.join(screenshots, 'temp')
  const diffPath = path.join(screenshots, 'diff')

  await takeScreenshots({
    resolutions, urls, waitForOptions, savePath: tempPath, interactive
  })

  await compareImages(screenshots, tempPath, diffPath, interactive)

  await displayDiffs(diffPath, interactive, screenshots, tempPath)
}
