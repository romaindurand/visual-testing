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

  checkUrls(parameters.urls)
  normalizedParameters.urls = normalizeUrls(parameters.urls)

  normalizedParameters.screenshots = screenshots

  normalizedParameters.interactive = Boolean(parameters.interactive)

  return normalizedParameters
}

function checkUrls (urls) {
  if (!Array.isArray(urls)) exitWithError('urls must be an Array', urls)
  if (!urls.every(url => isString(url) || isString(url.url))) {
    exitWithError('every url must be a String or an Object{url: <String>}')
  }
}

function normalizeUrls (urls) {
  return urls.map(urlItem => {
    if (isString(urlItem.url) && isString(urlItem.name)) return urlItem
    const name = urlItem.name || urlItem.replace(/\W/g, '_').replace(/_+/g, '_')
    const options = urlItem.options || null
    return {
      name,
      url: urlItem.url,
      options
    }
  }, [])
}

function isString (value) {
  return typeof value === 'string'
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
