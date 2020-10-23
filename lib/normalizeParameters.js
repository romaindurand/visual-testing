import chalk from 'chalk'
import exitWithError from './exitWithError.js'

export default function normalizeParameters (parameters) {
  const normalizedParameters = {}

  if (Array.isArray(parameters.resolutions)) {
    normalizedParameters.resolutions = parameters.resolutions
      .reduce((memo, deviceWidth) => {
        memo[String(deviceWidth)] = deviceWidth
        return memo
      }, {})
      .reduce(reduceResolutions, {})
  } else {
    normalizedParameters.resolutions = Object.entries(parameters.resolutions)
      .reduce(reduceResolutions, {})
  }

  const screenshots = parameters.screenshots
  if (!screenshots || !screenshots.oldPath || !screenshots.newPath || !screenshots.diffPath) {
    exitWithError('screenshots must be an Object({oldPath: String, newPath: String, diffPath: String})')
  }

  // TODO: accept an array of Strings and create name from url
  if (!parameters.urls || !Object.entries(parameters.urls).every(([key, value]) => (typeof key === 'string' && typeof value === 'string'))) {
    exitWithError('urls parameter must be an Object({screenshotName: \'url to capture\', screenshotName2: \'an other url})', parameters.urls)
  }
  normalizedParameters.urls = parameters.urls

  normalizedParameters.screenshots = screenshots

  normalizedParameters.interactive = Boolean(parameters.interactive)

  normalizedParameters.waitForOptions = parameters.waitForOptions || { type: 'timeout', value: 100 }

  return normalizedParameters
}

function reduceResolutions (memo, [name, deviceWidth]) {
  const resizedDeviceWidth = Math.max(deviceWidth, 400)
  if (deviceWidth < 400) {
    console.log(chalk.yellow('Warning: Minimum device width is 400 (px)'))
    console.log(chalk.yellow(`resolution ${name} will be resized as ${resizedDeviceWidth}\n`))
  }
  memo[name] = resizedDeviceWidth
  return memo
}
