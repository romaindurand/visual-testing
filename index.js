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
  screenshots, // TODO: find better API or names for screenshots paths
  interactive,
  waitForOptions
}) {
  // check inputs
  ;({
    resolutions, urls, screenshots, interactive, waitForOptions
  } = normalizeParameters({
    resolutions, urls, screenshots, interactive, waitForOptions
  }))

  // take screenshots => new
  await takeScreenshots({
    resolutions, urls, waitForOptions, savePath: screenshots.newPath, interactive
  })

  // compares old and new screenshots, create diff
  await compareImages(screenshots.oldPath, screenshots.newPath, screenshots.diffPath, interactive)

  // list errors (interactive or log + error code)
  await displayDiffs(screenshots.diffPath, interactive)
}
